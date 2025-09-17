import { JwtConfigModule } from 'src/auth/jwt-config.module'
import { DbModule } from 'src/db/db.module'

import { Module } from '@nestjs/common'

import { CurrentConsumptionController } from './current-consumption.controller'
import { CurrentConsumptionService } from './current-consumption.service'

@Module({
  imports: [DbModule, JwtConfigModule],
  providers: [CurrentConsumptionService],
  exports: [CurrentConsumptionService],
  controllers: [CurrentConsumptionController],
})
export class CurrentConsumptionModule {}
