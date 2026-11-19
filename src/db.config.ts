import { TypeOrmModuleOptions } from "@nestjs/typeorm"
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as dotenv from 'dotenv';

dotenv.config();

const currentDir = dirname(fileURLToPath(import.meta.url));

export const pgConfig: TypeOrmModuleOptions = {
    url: process.env.DB_URL,
    type: process.env.DB_TYPE as 'postgres',
    entities: [
        join(currentDir, '/**/*.entity{.ts,.js}')
    ],
    synchronize: process.env.DB_SYNCHRONIZE === 'true'
}