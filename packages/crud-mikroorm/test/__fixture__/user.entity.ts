import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'users2' })
export class User {
  @PrimaryKey()
  id?: number;

  @Property()
  nameFirst!: string;

  @Property()
  nameLast!: string;
}
