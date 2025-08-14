import { Controller } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Crud, CrudController } from '@ihelpee/crud';
import { Users } from './user-mikroorm.entity';

@ApiTags('users')
@Crud({
  model: {
    type: Users,
  },
  query: {
    alwaysPaginate: true,
    limit: 10,
    softDelete: true,
  },
  routes: {
    createOneBase: {
      decorators: [
        // Define any additional decorators here for createOne route
        ApiOperation({ summary: 'Create a user' }),
        ApiResponse({
          status: 201,
          description: 'The user has been successfully created',
        }),
      ],
    },
    getOneBase: {
      decorators: [
        // Define any additional decorators here for getOne route
        ApiOperation({ summary: 'Get a user by ID' }),
        ApiResponse({ status: 200, description: 'Return a user' }),
      ],
    },
  },
})
@Controller('users')
export class UsersController implements CrudController<Users> {
  constructor(public service: UsersService) {}
}
