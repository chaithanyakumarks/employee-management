import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { EmployeeStatus } from './employee-status.enum.js';
import { MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum.js'

@Entity()
export class Employee {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'varchar', 
        length: 100 
    })
    name: string

    @Column({ 
        type: 'varchar', 
        unique: true 
    })
    email: string

    @Column({ 
        type: 'varchar'
    })
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
        unique: true
    })
    employeeId: string 

    @CreateDateColumn({ type: 'timestamp' })
    joiningDate: Date

    @Column({
        type: 'varchar'
    })
    @MinLength(8)
    password: string
}