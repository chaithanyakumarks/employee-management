import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Query, Request } from '@nestjs/common'
import { EmployeeService } from './employee.service.js'
import { CreateEmployeeDto } from './dto/create.employee.dto.js'
import { UpdateEmployeeDto } from './dto/update.employee.dto.js'
import { RoleGuard } from '../role-guard/role-guard.guard.js'
import { EmployeeQueryDto } from './dto/employee.query.dto.js'
import { LoginDto } from './dto/login.dto.js'
import { JwtAuthGuard } from '../auth-guard/jwt-auth.guard.js'
import { AuthenticatedUser } from './interface/authenticated-user.interface.js'
import type { Request as ExpressRequest } from 'express';
import { Roles } from '../common/decorators/roles.decorator.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { UserRole } from '../common/enums/user-role.enum.js'

@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    // Public APIs
    @Post('login')
    loginEmployee(
        @Body() loginEmployeeDto: LoginDto
    ) {
        return this.employeeService.loginEmployee(loginEmployeeDto)
    }


    // Employee + Admin
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    getEmployeeList(
        @Query() query: EmployeeQueryDto
    ) {
        return this.employeeService.getEmployeeList(query)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('profile')
    fetchProfile(@Request() req: ExpressRequest) {
        console.log('Request user:', req.user)
        const { email } = req.user as AuthenticatedUser
        return this.employeeService.fetchProfile(email)
    }

    // Admin Only

    @Post('create')
    @Roles(UserRole.ADMIN)
    createEmployee(
        @Body() createEmployeeDto: CreateEmployeeDto
    ) {
        return this.employeeService.createEmployee(createEmployeeDto)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(':id')
    @Roles(UserRole.ADMIN)
    fetchEmployeeById(
        @Param('id') id: string
    ) {
        return this.employeeService.fetchEmployeeById(id)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id')
    @Roles(UserRole.ADMIN)
    updateEmployeeById(
        @Param('id') id: string,
        @Body() updateEmployeeDto: UpdateEmployeeDto 
    ) {
        return this.employeeService.updateEmployeeById(id, updateEmployeeDto)
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    removeEmployee(
        @Param('id') id: string
    ) {
        return this.employeeService.removeEmployee(id)
    }
}

// Pending works
// 3. Unit tests for EmployeeService and EmployeeController.
