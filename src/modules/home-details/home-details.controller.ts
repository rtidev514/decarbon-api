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

import { AnswerHomeDetailsDto } from './dto/answer-home-details.dto'
import { HomeDetailsService } from './home-details.service'

@Controller('/home-details')
export class HomeDetailsController {
  constructor(private readonly homeDetailsService: HomeDetailsService) {}

  @Post('/answer')
  answerHomeDetails(@Body() answerHomeDetailsDTO: AnswerHomeDetailsDto) {
    return this.homeDetailsService.answerHomeDetails(answerHomeDetailsDTO)
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
