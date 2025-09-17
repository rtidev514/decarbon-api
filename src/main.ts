import * as dotenv from 'dotenv'
import helmet from 'helmet'

import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

async function bootstrap() {
  dotenv.config()
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const port = configService.get<number>('NEST_APP_PORT') || 3000

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  app.setGlobalPrefix('api/v1')
  app.use(helmet())
  app.enableCors()
  app.enableShutdownHooks()
  await app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.debug(`RTI Accelerator API running on port ${port} `)
  })
}
bootstrap()
