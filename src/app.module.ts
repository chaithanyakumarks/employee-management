import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmployeeModule } from './employee/employee.module.js';
import { EmployeeLoggerService } from './employee-logger/employee-logger.service.js';
import { pgConfig } from './db.config.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(pgConfig),
    EmployeeModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
