import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import { EmployeeStatus } from './employee-status.enum.js';
import { MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum.js'

@Entity()
export class Employee {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    email: string

    @Column()
    department: string

    @Column({
        type: 'enum',
        enum: EmployeeStatus,
        default: EmployeeStatus.INTERNSHIP
    })
    employmentStatus: EmployeeStatus

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.EMPLOYEE,
    })
    role: UserRole

    @Column({
        type: 'varchar',
        length: 20,
    })
    employeeId: string 

    @Column()
    joiningDate: Date

    @Column()
    @MinLength(8)
    password: string
}