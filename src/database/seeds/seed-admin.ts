import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../app.module.js'
import { DataSource } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'

import { Employee } from '../../employee/entities/employee.entity.js'
import { UserRole } from '../../common/enums/user-role.enum.js'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    try {
        const configService = app.get(ConfigService)
        const dataSource = app.get(DataSource)

        const repository = dataSource.getRepository(Employee)

        // Read admin credentials
        const name = configService.get<string>('ADMIN_NAME')
        const email = configService.get<string>('ADMIN_EMAIL')
        const password = configService.get<string>('ADMIN_PASSWORD')
        const employeeId = configService.get<string>('ADMIN_EMPLOYEE_ID')
        const department = configService.get<string>('ADMIN_DEPARTMENT')

        if (!name || !email || !password || !employeeId || !department) {
            throw new Error('Missing admin configuration in .env');
        }
        if (password.length < 8) {
            throw new Error('Admin password must be at least 12 characters');
        }

        const existingAdmin = await repository.findOne({
            where: { email },
        })
        if (existingAdmin) {
            console.log('Admin already exists. Skipping creation.')
            return
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const admin = repository.create({
            name,
            email,
            password: hashedPassword,
            employeeId,
            department,
            role: UserRole.ADMIN,
            joiningDate: new Date(),
        });

        await repository.save(admin);
        console.log('Initial admin created successfully!');
        console.log(`Admin email: ${email}`);
    } finally {
        await app.close()
    }
}

await bootstrap()
        .catch((error) => {
            console.error('Admin seeding failed:', error)
            process.exitCode = 1
        })