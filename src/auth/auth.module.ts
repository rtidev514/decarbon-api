import { DbModule } from 'src/db/db.module'
import { UsersModule } from 'src/modules/users/users.module'

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtConfigModule } from './jwt-config.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtConfigModule,
    DbModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
