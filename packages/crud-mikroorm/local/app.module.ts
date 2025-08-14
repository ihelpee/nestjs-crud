import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersService } from './users.service';
import { UsersController } from './user.controller';
import { Users } from './user-mikroorm.entity';
import config from './mikro-orm.config';

@Module({
  imports: [MikroOrmModule.forRoot(config), MikroOrmModule.forFeature([Users])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
