import { JwtConfigModule } from 'src/auth/jwt-config.module'
import { DbModule } from 'src/db/db.module'

import { Module } from '@nestjs/common'

import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [DbModule, JwtConfigModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
