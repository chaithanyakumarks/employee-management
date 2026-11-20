import 'reflect-metadata'
import { GUARDS_METADATA } from '@nestjs/common/constants.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { JwtAuthGuard } from '../../src/auth-guard/jwt-auth.guard.js'
import { ROLES_KEY } from '../../src/common/decorators/roles.decorator.js'
import { RolesGuard } from '../../src/common/guards/roles.guard.js'
import { UserRole } from '../../src/common/enums/user-role.enum.js'
import { EmployeeController } from '../../src/employee/employee.controller.js'
import { EmployeeService } from '../../src/employee/employee.service.js'
import { EmployeeStatus } from '../../src/employee/entities/employee-status.enum.js'

describe('EmployeeController access', () => {
    const handler = (name: keyof EmployeeController) =>
        Object.getOwnPropertyDescriptor(EmployeeController.prototype, name)?.value

    const guardsOf = (name: keyof EmployeeController) =>
        Reflect.getMetadata(GUARDS_METADATA, handler(name)) ?? []

    const rolesOf = (name: keyof EmployeeController) =>
        Reflect.getMetadata(ROLES_KEY, handler(name)) ?? []

    it('leaves login public', () => {
        expect(guardsOf('loginEmployee')).toEqual([])
        expect(rolesOf('loginEmployee')).toEqual([])
    })

    it.each(['getEmployeeList', 'fetchProfile'] as const)(
        'requires a signed-in user for %s and does not restrict the role',
        (name) => {
            expect(guardsOf(name)).toEqual([JwtAuthGuard, RolesGuard])
            expect(rolesOf(name)).toEqual([])
        },
    )

    it.each([
        'createEmployee',
        'fetchEmployeeById',
        'updateEmployeeById',
        'removeEmployee',
    ] as const)('restricts %s to admins', (name) => {
        expect(guardsOf(name)).toEqual([JwtAuthGuard, RolesGuard])
        expect(rolesOf(name)).toEqual([UserRole.ADMIN])
    })
})

describe('EmployeeController', () => {
    const employeeService = {
        loginEmployee: vi.fn(),
        getEmployeeList: vi.fn(),
        fetchProfile: vi.fn(),
        createEmployee: vi.fn(),
        fetchEmployeeById: vi.fn(),
        updateEmployeeById: vi.fn(),
        removeEmployee: vi.fn(),
    }
    const controller = new EmployeeController(
        employeeService as unknown as EmployeeService,
    )

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('delegates login to the service', async () => {
        const credentials = { email: 'ada@example.com', password: 'password1' }
        employeeService.loginEmployee.mockResolvedValue({ message: 'Login successful' })

        await expect(controller.loginEmployee(credentials)).resolves.toEqual({
            message: 'Login successful',
        })
        expect(employeeService.loginEmployee).toHaveBeenCalledWith(credentials)
    })

    it('loads the signed-in profile from the token email', async () => {
        employeeService.fetchProfile.mockResolvedValue({ employee: { email: 'ada@example.com' } })

        await controller.fetchProfile({
            user: {
                email: 'ada@example.com',
                userId: 1,
                role: UserRole.EMPLOYEE,
            },
        } as never)

        expect(employeeService.fetchProfile).toHaveBeenCalledWith('ada@example.com')
    })

    it('delegates create, update, and delete to the service', async () => {
        const createDto = {
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            department: 'Engineering',
            employmentStatus: EmployeeStatus.PERMANENT,
            employeeId: 'EMP001',
            joiningDate: '2024-06-01',
            password: 'password1',
        }
        const updateDto = { department: 'Research' }

        await controller.createEmployee(createDto)
        await controller.updateEmployeeById('EMP001', updateDto)
        await controller.removeEmployee('EMP001')

        expect(employeeService.createEmployee).toHaveBeenCalledWith(createDto)
        expect(employeeService.updateEmployeeById).toHaveBeenCalledWith('EMP001', updateDto)
        expect(employeeService.removeEmployee).toHaveBeenCalledWith('EMP001')
    })
})
