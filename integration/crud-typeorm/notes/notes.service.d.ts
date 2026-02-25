import { TypeOrmCrudService } from '../../../packages/crud-typeorm/src';
import { Note } from './note.entity';
export declare class NotesService extends TypeOrmCrudService<Note> {
    constructor(repo: any);
}
