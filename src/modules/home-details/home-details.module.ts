import { JwtConfigModule } from 'src/auth/jwt-config.module'
import { DbModule } from 'src/db/db.module'

import { Module } from '@nestjs/common'

import { HomeDetailsController } from './home-details.controller'
import { HomeDetailsService } from './home-details.service'

@Module({
  imports: [DbModule, JwtConfigModule],
  providers: [HomeDetailsService],
  exports: [HomeDetailsService],
  controllers: [HomeDetailsController],
})
export class HomeDetailsModule {}
