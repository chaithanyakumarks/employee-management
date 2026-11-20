import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { EmployeeStatus } from './employee-status.enum.js';
import { MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum.js';

@Entity()
export class Employee {
  @ApiProperty({
    example: 1,
    description: 'Numeric primary key. API responses use employeeId instead.',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Ada Lovelace', maxLength: 100 })
  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @ApiProperty({ example: 'ada@example.com' })
  @Column({
    type: 'varchar',
    unique: true,
  })
  email: string;

  @ApiProperty({ example: 'Engineering' })
  @Column({
    type: 'varchar',
  })
  department: string;

  @ApiProperty({
    enum: EmployeeStatus,
    enumName: 'EmployeeStatus',
    example: EmployeeStatus.INTERNSHIP,
    default: EmployeeStatus.INTERNSHIP,
  })
  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.INTERNSHIP,
  })
  employmentStatus: EmployeeStatus;

  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.EMPLOYEE,
    default: UserRole.EMPLOYEE,
    description:
      'Assigned by the system. Create requests do not set this field.',
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @ApiProperty({ example: 'EMP001', maxLength: 20 })
  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  employeeId: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2024-06-01T00:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  joiningDate: Date;

  @ApiProperty({
    example: 'password1',
    minLength: 8,
    format: 'password',
    writeOnly: true,
    description: 'Stored as a bcrypt hash and omitted from API responses.',
  })
  @Column({
    type: 'varchar',
  })
  @MinLength(8)
  password: string;
}
