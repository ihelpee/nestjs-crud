import { EntityCaseNamingStrategy, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Users } from './user-mikroorm.entity';
declare const config: {
    entities: (typeof Users)[];
    dbName: string;
    user: string;
    password: string;
    port: number;
    host: string;
    debug: boolean;
    driver: typeof PostgreSqlDriver;
    namingStrategy: typeof EntityCaseNamingStrategy;
    allowGlobalContext: boolean;
};
export default config;
