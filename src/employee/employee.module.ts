import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller.js';
import { EmployeeService } from './employee.service.js';
import { EmployeeLoggerService } from '../employee-logger/employee-logger.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity.js';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { ConfigService } from '@nestjs/config';

@Module({
    imports:[
        TypeOrmModule.forFeature([Employee]),
        PassportModule.register({
            defaultStrategy: 'jwt',
        }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: '15m',
                },
            }),
        }),
    ],
    controllers: [
        EmployeeController
    ],
    providers: [
        EmployeeService, 
        EmployeeLoggerService,
        JwtStrategy
    ]
})
export class EmployeeModule {}
