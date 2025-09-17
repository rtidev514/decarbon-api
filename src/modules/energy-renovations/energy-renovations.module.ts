import { JwtConfigModule } from 'src/auth/jwt-config.module'
import { DbModule } from 'src/db/db.module'

import { Module } from '@nestjs/common'

import { EnergyRenovationsController } from './energy-renovations.controller'
import { EnergyRenovationService } from './energy-renovations.service'

@Module({
  imports: [DbModule, JwtConfigModule],
  providers: [EnergyRenovationService],
  exports: [EnergyRenovationService],
  controllers: [EnergyRenovationsController],
})
export class EnergyRenovationModule {}
