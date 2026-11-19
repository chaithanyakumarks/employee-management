import { Type } from 'class-transformer';
import {
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min
} from 'class-validator';

export class EmployeeQueryDto {

    @IsOptional()
    @IsString()
    search: string

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10

    @IsOptional()
    @IsString()
    department?: string

    @IsOptional()
    @IsIn(['name', 'joiningDate'])
    sortBy: string = 'name'

    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sortOrder: 'ASC' | 'DESC' = 'ASC'

    @IsOptional()
    @IsIn([
        'On Contract',
        'Permanent',
        'Internship',
        'Probation',
        'Resigned',
        'Terminated'
    ])
    employmentStatus?: string
}