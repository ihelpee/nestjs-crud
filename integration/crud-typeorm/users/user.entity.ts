import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  DeleteDateColumn,
} from 'typeorm';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CrudValidationGroups } from '@ihelpee/crud';

import { BaseEntity } from '../base-entity';
import { UserProfile } from '../users-profiles/user-profile.entity';
import { UserLicense } from '../users-licenses/user-license.entity';
import { Company } from '../companies/company.entity';
import { Project } from '../projects/project.entity';
import { UserProject } from '../projects/user-project.entity';

const { CREATE, UPDATE } = CrudValidationGroups;

export class Name {
  @IsString({ always: true })
  @Column({ nullable: true })
  first: string;

  @IsString({ always: true })
  @Column({ nullable: true })
  last: string;
}

@Entity('users')
export class User extends BaseEntity {
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @IsEmail({ require_tld: false }, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Type(() => Name)
  @Column(() => Name)
  name: Name;

  @Column({ nullable: true })
  profileId?: number;

  @Column({ nullable: true })
  companyId?: number;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  /**
   * Relations
   */

  @IsOptional({ always: true })
  @ValidateNested({ always: true })
  @Type(() => UserProfile)
  @OneToOne(() => UserProfile, (p) => p.user, { cascade: true })
  @JoinColumn()
  profile?: UserProfile;

  @ManyToOne(() => Company, (c) => c.users)
  company?: Company;

  @ManyToMany(() => Project, (c) => c.users)
  projects?: Project[];

  @OneToMany(() => UserProject, (el) => el.user, {
    persistence: false,
    onDelete: 'CASCADE',
  })
  userProjects?: UserProject[];

  @OneToMany(() => UserLicense, (ul) => ul.user)
  @Type(() => UserLicense)
  @JoinColumn()
  userLicenses?: UserLicense[];
}
