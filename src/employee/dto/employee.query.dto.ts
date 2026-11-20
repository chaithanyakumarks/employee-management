import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { EmployeeStatus } from '../entities/employee-status.enum.js';

export class EmployeeQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive match against name or email.',
    example: 'Ada',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Exact department name.',
    example: 'Engineering',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    enum: ['name', 'joiningDate'],
    default: 'name',
    example: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'joiningDate'])
  sortBy: string = 'name';

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
    default: 'ASC',
    example: 'ASC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional({
    enum: EmployeeStatus,
    enumName: 'EmployeeStatus',
    description:
      'Accepted by validation. The list is filtered by search and department.',
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  employmentStatus?: EmployeeStatus;
}
