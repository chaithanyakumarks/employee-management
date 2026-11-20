import { TypeOrmModuleOptions } from "@nestjs/typeorm"
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

const currentDir = dirname(fileURLToPath(import.meta.url));

export const dataSourceOptions: DataSourceOptions = {
    url: process.env.DB_URL,
    type: process.env.DB_TYPE as 'postgres',
    entities: [
        join(currentDir, '/**/*.entity{.ts,.js}')
    ],
    migrations: [
        join(currentDir, '/**/migration{.ts,.js}')
    ],
    synchronize: process.env.DB_SYNCHRONIZE === 'true'
};

const dataSource = new DataSource(dataSourceOptions)
export default dataSource