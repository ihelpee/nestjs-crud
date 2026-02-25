import { TypeOrmCrudService } from '@ihelpee/crud-typeorm';
import { Device } from './device.entity';
export declare class DevicesService extends TypeOrmCrudService<Device> {
    constructor(repo: any);
}
