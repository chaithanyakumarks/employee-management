import { NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Repository, ILike } from 'typeorm'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EmployeeLoggerService } from '../../src/employee-logger/employee-logger.service.js'
import { UserRole } from '../../src/common/enums/user-role.enum.js'
import { EmployeeService } from '../../src/employee/employee.service.js'
import { EmployeeStatus } from '../../src/employee/entities/employee-status.enum.js'
import { Employee } from '../../src/employee/entities/employee.entity.js'
import * as bcrypt from 'bcrypt'

vi.mock('bcrypt', () => ({
    hash: vi.fn(),
    compare: vi.fn(),
}))

const employee = {
    id: 4,
    employeeId: 'EMP001',
    name: 'Test',
    email: 'test@example.com',
    department: 'Engineering',
    employmentStatus: EmployeeStatus.PERMANENT,
    role: UserRole.EMPLOYEE,
    joiningDate: new Date('2024-06-01T00:00:00.000Z'),
    password: 'stored-hash',
}

const listQuery = {
    search: undefined as string | undefined,
    page: 1,
    limit: 10,
    department: undefined as string | undefined,
    sortBy: 'name',
    sortOrder: 'ASC' as const,
}

describe('EmployeeService', () => {
    const employeeRepository = {
        findAndCount: vi.fn(),
        findOne: vi.fn(),
        findOneBy: vi.fn(),
        save: vi.fn(),
        create: vi.fn((value: unknown) => value),
        delete: vi.fn(),
    }
    const logger = { log: vi.fn() }
    const jwtService = { sign: vi.fn() }
    const service = new EmployeeService(
        employeeRepository as unknown as Repository<Employee>,
        logger as unknown as EmployeeLoggerService,
        jwtService as unknown as JwtService,
    )

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getEmployeeList', () => {
        it('returns a page of employees without passwords', async () => {
            employeeRepository.findAndCount.mockResolvedValue([[employee], 25])

            const result = await service.getEmployeeList({
                ...listQuery,
                page: 2,
                limit: 10,
                department: 'Engineering',
            })

            expect(employeeRepository.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 10,
                    take: 10,
                    where: [{ department: 'Engineering' }],
                    order: { name: 'ASC' },
                    select: expect.not.objectContaining({ password: true }),
                }),
            )
            expect(result).toEqual({
                employees: [employee],
                pagination: {
                    total: 25,
                    page: 2,
                    limit: 10,
                    totalPages: 3,
                    hasNextPage: true,
                    hasPreviousPage: true,
                },
            })
        })

        it('searches name and email and clamps the page size', async () => {
            employeeRepository.findAndCount.mockResolvedValue([[], 0])

            await service.getEmployeeList({
                ...listQuery,
                search: '  ada  ',
                page: 0,
                limit: 500,
            })

            expect(employeeRepository.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 0,
                    take: 100,
                    where: [
                        { name: ILike('%ada%') },
                        { email: ILike('%ada%') },
                    ],
                }),
            )
        })

        it('returns a failure message when the query throws', async () => {
            employeeRepository.findAndCount.mockRejectedValue(new Error('db down'))

            await expect(service.getEmployeeList(listQuery)).resolves.toEqual({
                message: 'Failed to fetch the employees list',
            })
        })
    })

    describe('fetchEmployeeById', () => {
        it('returns the employee when the id exists', async () => {
            employeeRepository.findOne.mockResolvedValue(employee)

            await expect(service.fetchEmployeeById('EMP001')).resolves.toEqual({
                employee,
            })
        })

        it('returns a not-found message for an unknown id', async () => {
            employeeRepository.findOne.mockResolvedValue(null)

            await expect(service.fetchEmployeeById('MISSING')).resolves.toEqual({
                message: 'Employee with id MISSING is not found!',
            })
        })
    })

    describe('createEmployee', () => {
        const createDto = {
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            department: 'Engineering',
            employmentStatus: EmployeeStatus.PERMANENT,
            employeeId: 'EMP001',
            joiningDate: '2024-06-01T00:00:00.000Z',
            password: 'password1',
        }

        it('stores a hashed password and omits it from the response', async () => {
            employeeRepository.findOne.mockResolvedValue(null)
            vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never)
            employeeRepository.save.mockImplementation(async (value) => value)

            const result = await service.createEmployee(createDto)

            expect(bcrypt.hash).toHaveBeenCalledWith('password1', 12)
            expect(employeeRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'ada@example.com',
                    password: 'hashed-password',
                    joiningDate: new Date('2024-06-01T00:00:00.000Z'),
                }),
            )
            expect(result).toEqual({
                employee: {
                    employeeId: 'EMP001',
                    name: 'Ada Lovelace',
                    email: 'ada@example.com',
                    department: 'Engineering',
                    employmentStatus: EmployeeStatus.PERMANENT,
                    joiningDate: new Date('2024-06-01T00:00:00.000Z'),
                },
            })
            expect(result).not.toHaveProperty('employee.password')
        })

        it('rejects a duplicate email before checking the employee id', async () => {
            employeeRepository.findOne.mockResolvedValueOnce(employee)

            await expect(service.createEmployee(createDto)).resolves.toEqual({
                message: 'Employee with this email already exists',
            })
            expect(employeeRepository.save).not.toHaveBeenCalled()
        })

        it('rejects a duplicate employee id', async () => {
            employeeRepository.findOne
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(employee)

            await expect(service.createEmployee(createDto)).resolves.toEqual({
                message: 'Employee with this ID already exists',
            })
        })
    })

    describe('updateEmployeeById', () => {
        it('updates only the fields that were sent', async () => {
            const stored = { ...employee }
            employeeRepository.findOneBy.mockResolvedValue(stored)
            employeeRepository.save.mockImplementation(async (value) => value)

            const result = await service.updateEmployeeById('EMP001', {
                department: 'Research',
            })

            expect(stored.department).toBe('Research')
            expect(stored.name).toBe('Test')
            expect(result).toEqual({
                employee: {
                    employeeId: 'EMP001',
                    name: 'Test',
                    email: 'test@example.com',
                    department: 'Research',
                    employmentStatus: EmployeeStatus.PERMANENT,
                    joiningDate: employee.joiningDate,
                },
                message: 'Employee has been updated successfully',
            })
        })

        it('throws when the body has no updatable fields', async () => {
            await expect(
                service.updateEmployeeById('EMP001', {}),
            ).rejects.toBeInstanceOf(NotFoundException)
        })

        it('returns a not-found message for an unknown id', async () => {
            employeeRepository.findOneBy.mockResolvedValue(null)

            await expect(
                service.updateEmployeeById('MISSING', { name: 'Grace' }),
            ).resolves.toEqual({
                message: 'Employee with id MISSING is not found!',
            })
        })
    })

    describe('removeEmployee', () => {
        it('removes an existing employee', async () => {
            employeeRepository.delete.mockResolvedValue({ affected: 1 })

            await expect(service.removeEmployee('EMP001')).resolves.toEqual({
                message: 'Removed the employee with id EMP001.',
            })
        })

        it('returns a not-found message when nothing was deleted', async () => {
            employeeRepository.delete.mockResolvedValue({ affected: 0 })

            await expect(service.removeEmployee('MISSING')).resolves.toEqual({
                message: 'Employee with id MISSING is not found!',
            })
        })
    })

    describe('loginEmployee', () => {
        const credentials = {
            email: 'ada@example.com',
            password: 'password1',
        }

        it('returns a bearer token and does not return the password', async () => {
            employeeRepository.findOne.mockResolvedValue(employee)
            vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
            jwtService.sign.mockReturnValue('signed-token')

            const result = await service.loginEmployee(credentials)

            expect(jwtService.sign).toHaveBeenCalledWith({
                email: 'test@example.com',
                id: 4,
                role: UserRole.EMPLOYEE,
            })
            expect(result).toEqual({
                message: 'Login successful',
                accessToken: 'signed-token',
                tokenType: 'Bearer',
                expiresIn: '15m',
                user: {
                    employeeId: 'EMP001',
                    email: 'test@example.com',
                },
            })
        })

        it('rejects an unknown email', async () => {
            employeeRepository.findOne.mockResolvedValue(null)

            await expect(service.loginEmployee(credentials)).resolves.toEqual({
                message: 'Failed to login the employee',
            })
            expect(jwtService.sign).not.toHaveBeenCalled()
        })

        it('rejects a wrong password', async () => {
            employeeRepository.findOne.mockResolvedValue(employee)
            vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

            await expect(service.loginEmployee(credentials)).resolves.toEqual({
                message: 'Failed to login the employee',
            })
            expect(jwtService.sign).not.toHaveBeenCalled()
        })
    })

    describe('fetchProfile', () => {
        it('returns the profile for the signed-in email', async () => {
            employeeRepository.findOne.mockResolvedValue(employee)

            await expect(service.fetchProfile('ada@example.com')).resolves.toEqual({
                employee,
            })
            expect(employeeRepository.findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { email: 'ada@example.com' },
                    select: expect.not.objectContaining({ password: true }),
                }),
            )
        })

        it('fails when the request has no email', async () => {
            await expect(service.fetchProfile()).resolves.toEqual({
                message: 'Failed to fetch the employee profile',
            })
        })

        it('returns a not-found message when the profile is missing', async () => {
            employeeRepository.findOne.mockResolvedValue(null)

            await expect(service.fetchProfile('missing@example.com')).resolves.toEqual({
                message: 'Employee profile is not found!',
            })
        })
    })
})
