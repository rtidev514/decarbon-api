import * as Joi from 'joi'

import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AuthModule } from './auth/auth.module'
import config from './config'
import { enviroments } from './enviroments'
import { CurrentConsumptionModule } from './modules/current-consumption/current-consumption.module'
import { EnergyRenovationModule } from './modules/energy-renovations/energy-renovations.module'
import { HomeDetailsModule } from './modules/home-details/home-details.module'
import { TasksModule } from './modules/tasks/tasks.module'
import { UsersModule } from './modules/users/users.module'

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      envFilePath: enviroments[process.env.NODE_ENV] || '.env',
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        POSTGRES_LOCAL_PORT: Joi.number().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        APPLICATION_LOCALE: Joi.string().valid('en').required(),
      }),
    }),
    AuthModule,
    CurrentConsumptionModule,
    EnergyRenovationModule,
    HomeDetailsModule,
    TasksModule,
    UsersModule,
  ],
  controllers: [],
  providers: [CacheModule],
})
export class AppModule {}
