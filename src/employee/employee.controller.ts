import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Query, Request } from '@nestjs/common';
import { EmployeeService } from './employee.service.js';
import { CreateEmployeeDto } from './dto/create.employee.dto.js';
import { UpdateEmployeeDto } from './dto/update.employee.dto.js';
import { RoleGuard } from '../role-guard/role-guard.guard.js';
import { EmployeeQueryDto } from './dto/employee.query.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from '../auth-guard/jwt-auth.guard.js';
import { AuthenticatedUser } from './interface/authenticated-user.interface.js';
import type { Request as ExpressRequest } from 'express';

@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    getEmployeeList(
        @Query() query: EmployeeQueryDto
    ) {
        return this.employeeService.getEmployeeList(query)
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    fetchProfile(@Request() req: ExpressRequest) {
        console.log('Request user:', req.user)
        const { email } = req.user as AuthenticatedUser
        return this.employeeService.fetchProfile(email)
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    fetchEmployeeById(
        @Param('id') id: string
    ) {
        return this.employeeService.fetchEmployeeById(id)
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @UseGuards(RoleGuard)
    updateEmployeeById(
        @Param('id') id: string,
        @Body() updateEmployeeDto: UpdateEmployeeDto 
    ) {
        return this.employeeService.updateEmployeeById(id, updateEmployeeDto)
    }

    @Post('create')
    @UseGuards(RoleGuard)
    createEmployee(
        @Body() createEmployeeDto: CreateEmployeeDto
    ) {
        return this.employeeService.createEmployee(createEmployeeDto)
    }

    @Post('login')
    loginEmployee(
        @Body() loginEmployeeDto: LoginDto
    ) {
        return this.employeeService.loginEmployee(loginEmployeeDto)
    }

    @Delete(':id')
    @UseGuards(RoleGuard)
    @UseGuards(JwtAuthGuard)
    removeEmployee(
        @Param('id') id: string
    ) {
        return this.employeeService.removeEmployee(id)
    }
}

// Pending works
// 3. Unit tests for EmployeeService and EmployeeController.
