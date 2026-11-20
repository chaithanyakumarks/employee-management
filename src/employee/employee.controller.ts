import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EmployeeService } from './employee.service.js';
import { CreateEmployeeDto } from './dto/create.employee.dto.js';
import { UpdateEmployeeDto } from './dto/update.employee.dto.js';
import { EmployeeQueryDto } from './dto/employee.query.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from '../auth-guard/jwt-auth.guard.js';
import { AuthenticatedUser } from './interface/authenticated-user.interface.js';
import type { Request as ExpressRequest } from 'express';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import {
  ForbiddenErrorResponseDto,
  NotFoundErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/http-error.response.dto.js';
import {
  CreateEmployeeResponseDto,
  EmployeeListResponseDto,
  EmployeeResponseDto,
  LoginResponseDto,
  MessageResponseDto,
  UpdateEmployeeResponseDto,
} from './dto/employee.response.dto.js';


@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('login')
  @ApiTags('Authentication')
  @ApiOperation({
    summary: 'Log in',
    description:
      'Public. Returns a bearer token that expires in 15 minutes. Invalid credentials still respond with HTTP 200 and data.message set to "Failed to login the employee".',
  })
  @ApiOkResponse({
    description: 'Login result.',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Email or password failed validation.',
    type: ValidationErrorResponseDto,
  })
  loginEmployee(@Body() loginEmployeeDto: LoginDto) {
    return this.employeeService.loginEmployee(loginEmployeeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiTags('Employees')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List employees',
    description:
      'Any signed-in user. Supports search, department, sorting, and pagination. Passwords are omitted.',
  })
  @ApiOkResponse({
    description: 'A page of employees.',
    type: EmployeeListResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'A query parameter failed validation.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token.',
    type: UnauthorizedErrorResponseDto,
  })
  getEmployeeList(@Query() query: EmployeeQueryDto) {
    return this.employeeService.getEmployeeList(query);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiTags('Employees')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get the signed-in profile',
    description:
      'Any signed-in user. The employee is looked up by the email in the access token.',
  })
  @ApiOkResponse({
    description:
      'The signed-in employee, or a message when the profile cannot be found.',
    type: EmployeeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token.',
    type: UnauthorizedErrorResponseDto,
  })
  fetchProfile(@Request() req: ExpressRequest) {
    console.log('Request user:', req.user);
    const { email } = req.user as AuthenticatedUser;
    return this.employeeService.fetchProfile(email);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiTags('Employees')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create an employee',
    description:
      'Admin only. The new employee receives the EMPLOYEE role. The password is stored as a bcrypt hash and is not returned.',
  })
  @ApiOkResponse({
    description:
      'The created employee, or a message when the email or employee id already exists.',
    type: CreateEmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request body failed validation.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token.',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'The signed-in user is not an admin.',
    type: ForbiddenErrorResponseDto,
  })
  createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(createEmployeeDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiTags('Employees')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get an employee',
    description:
      'Admin only. Looks up the business employee id, not the numeric primary key.',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee id.',
    example: 'EMP001',
  })
  @ApiOkResponse({
    description: 'The employee, or a message when that id does not exist.',
    type: EmployeeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token.',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'The signed-in user is not an admin.',
    type: ForbiddenErrorResponseDto,
  })
  fetchEmployeeById(@Param('id') id: string) {
    return this.employeeService.fetchEmployeeById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiTags('Employees')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update an employee',
    description:
      'Admin only. Applies name, email, department, and employment status. employeeId, joiningDate, and password are ignored.',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee id.',
    example: 'EMP001',
  })
  @ApiOkResponse({
    description:
      'The updated employee, or a message when that id does not exist.',
    type: UpdateEmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request body failed validation.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token.',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'The signed-in user is not an admin.',
    type: ForbiddenErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The body did not include a field that can be updated.',
    type: NotFoundErrorResponseDto,
  })
  updateEmployeeById(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.updateEmployeeById(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiTags('Employees')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete an employee',
    description: 'Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee id.',
    example: 'EMP001',
  })
  @ApiOkResponse({
    description:
      'A confirmation message, or a message when that id does not exist.',
    type: MessageResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token.',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'The signed-in user is not an admin.',
    type: ForbiddenErrorResponseDto,
  })
  removeEmployee(@Param('id') id: string) {
    return this.employeeService.removeEmployee(id);
  }
}
