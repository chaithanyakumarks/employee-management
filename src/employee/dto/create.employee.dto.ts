import { IsString, IsEmail, IsEnum, IsNotEmpty, IsDateString } from 'class-validator';
import { EmployeeStatus } from '../entities/employee-status.enum.js';

export class CreateEmployeeDto {
    
    @IsString()
    name: string

    @IsEmail()
    email: string

    @IsString()
    department: string

    @IsEnum(EmployeeStatus)
    employmentStatus: EmployeeStatus

    @IsString()
    employeeId: string

    @IsNotEmpty()
    @IsDateString()
    joiningDate: string

    @IsNotEmpty()
    @IsString()
    password: string
}