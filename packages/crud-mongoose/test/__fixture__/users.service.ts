import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongooseCrudService } from '../../src/mongoose-crud.service';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService extends MongooseCrudService<UserDocument> {
  constructor(@InjectModel(User.name) model: Model<UserDocument>) {
    super(model);
  }
}
