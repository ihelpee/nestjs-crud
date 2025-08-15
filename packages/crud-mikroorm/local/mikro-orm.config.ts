import { EntityCaseNamingStrategy, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Users } from './user-mikroorm.entity';

const config = {
  entities: [Users],
  dbName: 'ihelpee_crud',
  user: 'ihelpee_crud',
  password: 'ihelpee_crud',
  port: 5432,
  host: 'localhost',
  debug: true,
  driver: PostgreSqlDriver,
  namingStrategy: EntityCaseNamingStrategy,
  allowGlobalContext: true,
};

export default config;
