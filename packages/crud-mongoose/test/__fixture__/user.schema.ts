import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  nameFirst: string;

  @Prop({ required: true })
  nameLast: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
