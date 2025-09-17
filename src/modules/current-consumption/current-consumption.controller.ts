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

import { CurrentConsumptionDto } from './dto/answer-current-consumption.dto'
import { CurrentConsumptionService } from './current-consumption.service'

@Controller('/current-consumption')
export class CurrentConsumptionController {
  constructor(
    private readonly currentConsumptionService: CurrentConsumptionService,
  ) {}

  @Post('/answer')
  answerCurrentConsumption(
    @Body() answerCurrentConsumptionDTO: CurrentConsumptionDto,
  ) {
    return this.currentConsumptionService.answerCurrentConsumption(
      answerCurrentConsumptionDTO,
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
