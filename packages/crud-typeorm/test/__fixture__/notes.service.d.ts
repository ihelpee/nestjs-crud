import { TypeOrmCrudService } from '../../../crud-typeorm/src/typeorm-crud.service';
import { Note } from '../../../../integration/crud-typeorm/notes';
export declare class NotesService extends TypeOrmCrudService<Note> {
    constructor(repo: any);
}
