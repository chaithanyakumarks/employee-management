import { ApiProperty } from '@nestjs/swagger';
import { EmployeeStatus } from '../entities/employee-status.enum.js';

export class PublicEmployeeDto {
  @ApiProperty({ example: 'EMP001', maxLength: 20 })
  employeeId: string;

  @ApiProperty({ example: 'Ada Lovelace', maxLength: 100 })
  name: string;

  @ApiProperty({ example: 'ada@example.com' })
  email: string;

  @ApiProperty({ example: 'Engineering' })
  department: string;

  @ApiProperty({
    enum: EmployeeStatus,
    enumName: 'EmployeeStatus',
    example: EmployeeStatus.PERMANENT,
  })
  employmentStatus: EmployeeStatus;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2024-06-01T00:00:00.000Z',
  })
  joiningDate: string;
}

export class PaginationDto {
  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;
}

export class ApiEnvelopeDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;
}

export class LoginUserDto {
  @ApiProperty({ example: 'ADMIN_001' })
  employeeId: string;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;
}

export class LoginDataDto {
  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example' })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: '15m' })
  expiresIn: string;

  @ApiProperty({ type: LoginUserDto })
  user: LoginUserDto;
}

export class LoginResponseDto extends ApiEnvelopeDto {
  @ApiProperty({ type: LoginDataDto })
  data: LoginDataDto;
}

export class EmployeeListDataDto {
  @ApiProperty({ type: [PublicEmployeeDto] })
  employees: PublicEmployeeDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class EmployeeListResponseDto extends ApiEnvelopeDto {
  @ApiProperty({ type: EmployeeListDataDto })
  data: EmployeeListDataDto;
}

export class EmployeeDataDto {
  @ApiProperty({ type: PublicEmployeeDto })
  employee: PublicEmployeeDto;
}

export class EmployeeResponseDto extends ApiEnvelopeDto {
  @ApiProperty({ type: EmployeeDataDto })
  data: EmployeeDataDto;
}

export class CreateEmployeeResponseDto extends EmployeeResponseDto {}

export class UpdateEmployeeDataDto extends EmployeeDataDto {
  @ApiProperty({ example: 'Employee has been updated successfully' })
  message: string;
}

export class UpdateEmployeeResponseDto extends ApiEnvelopeDto {
  @ApiProperty({ type: UpdateEmployeeDataDto })
  data: UpdateEmployeeDataDto;
}

export class MessageDataDto {
  @ApiProperty({ example: 'Removed the employee with id EMP001.' })
  message: string;
}

export class MessageResponseDto extends ApiEnvelopeDto {
  @ApiProperty({ type: MessageDataDto })
  data: MessageDataDto;
}
