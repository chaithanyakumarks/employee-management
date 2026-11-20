import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { EmployeeStatus } from '../entities/employee-status.enum.js';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Ada Lovelace', maxLength: 100 })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Engineering' })
  @IsString()
  department: string;

  @ApiProperty({
    enum: EmployeeStatus,
    enumName: 'EmployeeStatus',
    example: EmployeeStatus.PERMANENT,
  })
  @IsEnum(EmployeeStatus)
  employmentStatus: EmployeeStatus;

  @ApiProperty({ example: 'EMP001', maxLength: 20 })
  @IsString()
  employeeId: string;

  @ApiProperty({
    example: '2024-06-01',
    description: 'ISO 8601 date.',
  })
  @IsNotEmpty()
  @IsDateString()
  joiningDate: string;

  @ApiProperty({ example: 'password1', format: 'password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
