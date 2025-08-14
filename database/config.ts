import { join } from 'path';

export enum DatabaseType {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
}

export const createDbConfig = (type: DatabaseType) => ({
  type,
  host: '127.0.0.1',
  port: type === 'postgres' ? 5432 : 3306,
  username: type === 'postgres' ? 'root' : 'ihelpee_crud',
  password: type === 'postgres' ? 'root' : 'ihelpee_crud',
  database: 'ihelpee_crud',
  synchronize: false,
  logging: true,
  entities: [join(process.cwd(), 'integration', './**/*.entity{.ts,.js}')],
  migrationsTableName: 'migrations',
  migrations: [`${join(__dirname, 'migrations')}/*`],
});
