import { ErrorMessages } from 'src/common/app-messages'

import {
  Body,
  Catch,
  Controller,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common'

import { EnergyRenovationDto } from './dto/answer-energy-renovations.dto'
import { EnergyRenovationService } from './energy-renovations.service'

@Controller('/energy-renovation')
export class EnergyRenovationsController {
  constructor(
    private readonly currentConsumptionService: EnergyRenovationService,
  ) {}

  @Post('/answer')
  answerEnergyRenovation(
    @Body() answerEnergyRenovationDTO: EnergyRenovationDto,
  ) {
    return this.currentConsumptionService.answerEnergyRenovation(
      answerEnergyRenovationDTO,
    )
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, response) {
    console.error(exception)
    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: exception.message,
      })
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
      })
    }
  }
}
