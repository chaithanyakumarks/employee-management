import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { EmployeeLoggerService } from '../employee-logger/employee-logger.service.js';
import { CreateEmployeeDto } from './dto/create.employee.dto.js';
import { UpdateEmployeeDto } from './dto/update.employee.dto.js';
import { Employee } from './entities/employee.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeQueryDto } from './dto/employee.query.dto.js';
import { FindOptionsWhere, ILike } from 'typeorm';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {

    constructor(
        @InjectRepository(Employee)
        private employeeRepository: Repository<Employee>,
        private readonly logger: EmployeeLoggerService,
        private readonly jwtService: JwtService,
    ) {}

    async getEmployeeList(
        query: EmployeeQueryDto
    ) {
        this.logger.log('Fetching employee list')
        try {
            const {
                search,
                department,
                employmentStatus,
                sortBy,
                sortOrder,
                page,
                limit
            } = query;

            const currentPage = Math.max(1, Number(page) || 1);
            const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));
            
            const filters: FindOptionsWhere<Employee> = {
                ...(department && { department })
            };

            const where: FindOptionsWhere<Employee>[] = search?.trim()? [
                {
                    ...filters,
                    name: ILike(`%${search.trim()}%`)
                },
                {
                    ...filters,
                    email: ILike(`%${search.trim()}%`)
                }
            ] : [filters];

            const skip = (currentPage - 1) * pageSize;
            const [employees, total] = await this.employeeRepository.findAndCount({
                select: {
                    employeeId: true,
                    name: true,
                    email: true,
                    department: true,
                    employmentStatus: true,
                    joiningDate: true
                },
                skip,
                take: pageSize,
                where,
                order: {
                    [sortBy]: sortOrder
                },
            });

            const totalPages = Math.ceil(total / pageSize);
            this.logger.log(`Fetched ${employees.length} employees`);

            return {
                employees,
                pagination: {
                    total,
                    page: currentPage,
                    limit: pageSize,
                    totalPages,
                    hasNextPage: currentPage < totalPages,
                    hasPreviousPage: currentPage > 1
                }
            }
        } catch (error) {
            this.logger.log(
                `Error occurred while fetching the employees: ${error}`
            );
            return {
                message: 'Failed to fetch the employees list'
            };
        }
    }

    async fetchEmployeeById(id: string) {
        this.logger.log(`Fetching employee with ID: ${id}`)
        try {
            const employee = await this.employeeRepository.findOne({
                where: {
                    employeeId: id
                },
                select: {
                    employeeId: true,
                    name: true,
                    email: true,
                    department: true,
                    employmentStatus: true,
                    joiningDate: true
                },
            })
            if (employee) {
                return {
                    employee
                }
            } else {
                return {
                    message: `Employee with id ${id} is not found!`
                }
            }
        } catch (error) {
            this.logger.log(
                `Error occurred while fetching the employee: ${error}`
            );
            return {
                message: `Failed to fetch the employee by id ${id}`
            };
        }
    }

    async updateEmployeeById(
        id: string, 
        updateEmployeeDto: UpdateEmployeeDto
    ) {
        this.logger.log(`Updating employee with ID: ${id}`)
        if (updateEmployeeDto === undefined) {
            return {
                message: 'Request body is empty'
            }
        }
        if(updateEmployeeDto.name === undefined && 
            updateEmployeeDto.email === undefined &&
            updateEmployeeDto.department === undefined && 
            updateEmployeeDto.employmentStatus === undefined) {
                throw new NotFoundException(`Nothing to update on the Employee with ID ${id}`);
                return
        }
        try {
            const employee = await this.employeeRepository.findOneBy({
                employeeId: id
            })
            if (employee) {
                if (updateEmployeeDto.name !== undefined) {
                    employee.name = updateEmployeeDto.name
                }
                if (updateEmployeeDto.email !== undefined) {
                    employee.email = updateEmployeeDto.email
                }
                if (updateEmployeeDto.department !== undefined) {
                    employee.department = updateEmployeeDto.department
                }
                if (updateEmployeeDto.employmentStatus !== undefined) {
                    employee.employmentStatus = updateEmployeeDto.employmentStatus
                }
                let savedEmployee = await this.employeeRepository.save(employee)
                return {
                    employee: {
                        employeeId: savedEmployee.employeeId,
                        name: savedEmployee.name,
                        email: savedEmployee.email,
                        department: savedEmployee.department,
                        employmentStatus: savedEmployee.employmentStatus,
                        joiningDate: savedEmployee.joiningDate
                    },
                    message: "Employee has been updated successfully"
                }
            } else {
                return {
                    message: `Employee with id ${id} is not found!`
                }
            }   
        } catch (error) {
            this.logger.log(
                `Error occurred while updating the employee: ${error}`
            );
            return {
                message: `Failed to update the employee for id ${id}`
            };
        }
    }

    async createEmployee(createEmployeeDto: CreateEmployeeDto) {
        this.logger.log('Creating new employee')
        if (!createEmployeeDto) {
            return {
                message: 'Request body is empty'
            }
        }
        try {
            this.logger.log(createEmployeeDto.email);
            const duplicateEmployee = await this.employeeRepository.findOne({ where: {
                email: createEmployeeDto.email
            }})
            if (duplicateEmployee) {
                return {
                    message: 'Employee with this email already exists'
                };
            }
            const employeeIdExists = await this.employeeRepository.findOne({ where: {
                employeeId: createEmployeeDto.employeeId
            }})
            if (employeeIdExists) {
                return {
                    message: 'Employee with this ID already exists'
                };
            }

            const hashedPassword = await bcrypt.hash(
                createEmployeeDto.password,
                12,
            )

            const joiningDate = new Date(createEmployeeDto.joiningDate);
            const employeeInfo = {
                ...createEmployeeDto,
                joiningDate: joiningDate,
                password: hashedPassword
            }

            const newEmployee = this.employeeRepository.create(employeeInfo);
            let employee = await this.employeeRepository.save(newEmployee);
            return {
                employee: {
                    employeeId: employee.employeeId,
                    name: employee.name,
                    email: employee.email,
                    department: employee.department,
                    employmentStatus: employee.employmentStatus,
                    joiningDate: employee.joiningDate
                }
            }
        } catch(error) {
            this.logger.log(
                `Error occurred while creating the employee: ${error}`
            )
            return {
                message: 'Failed to create the employee'
            }
        }
    }

    async removeEmployee(id: string) {
        this.logger.log(`Removing employee with ID: ${id}`)
        try {
            const employee = await this.employeeRepository.delete({ employeeId: id })
            if (employee.affected !== 0) {
                return {
                    message: `Removed the employee with id ${id}.`
                }
            } else {
                return {
                    message: `Employee with id ${id} is not found!`
                }
            }
        } catch (error) {
            this.logger.log(
                `Error occurred while removing the employee: ${error}`
            );
            return {
                message: 'Failed to remove the employee from the list'
            };
        }
    }

    async loginEmployee(
        loginEmployeeDto: LoginDto
    ) {
        this.logger.log(`Logging in employee with email: ${loginEmployeeDto.email}`)
        try {
            const { email, password } = loginEmployeeDto
            const employee = await this.employeeRepository.findOne({ where: {
                email: email
            }})
            if (!employee) {
                throw new UnauthorizedException('Invalid email or password')
            }

            const isPasswordValid = await bcrypt.compare(password, employee.password)
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid email or password')
            }

            const payload = {
                email: employee.email,
                id: employee.id,
                role: employee.role
            }
            const token = await this.jwtService.sign(payload)
            this.logger.log(`Token has generated for email: ${loginEmployeeDto.email}`)

            return {
                message: 'Login successful',
                accessToken: token,
                tokenType: 'Bearer',
                expiresIn: '15m',
                user: {
                    employeeId: employee.employeeId,
                    email: employee.email,
                }
            }
        } catch (error) {
            this.logger.log(
                `Error occurred while logging in the employee: ${error}`
            );
            return {
                message: 'Failed to login the employee'
            };
        }
    }

    async fetchProfile(
        email?: string
    ) {
        this.logger.log('Fetching employee profile')
        try {
            if (!email) {
                throw new UnauthorizedException('User email not found');
            }

            const employee = await this.employeeRepository.findOne({
                select: {
                    employeeId: true,
                    name: true,
                    email: true,
                    department: true,
                    employmentStatus: true,
                    joiningDate: true
                },
                where: {
                    email
                }
            })
            if (employee) {
                return {
                    employee
                }
            } else {
                return {
                    message: `Employee profile is not found!`
                }
            }
        } catch (error) {
            this.logger.log(
                `Error occurred while fetching the employee profile: ${error}`
            );
            return {
                message: `Failed to fetch the employee profile`
            };
        }
    }
}