import { ErrorMessages } from 'src/common/app-messages'

import {
  Body,
  Catch,
  Controller,
  ExceptionFilter,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common'

import { CreateUserDto } from './dto/create-user.dto'
import { SignInDto } from '../../auth/dto/sign-in.dto'
import { UsersService } from './users.service'
import { AccountTypeGuard, AuthGuard } from 'src/auth/auth.guard'
import { AccountTypeEnum } from 'src/util/enums'

export interface ResetPasswordDTO {
  email: string
  newPasswordToken: string
  password: string
}

export interface VerifyAdminDTO {
  email: string
  password: string
  verificationToken: string
}

export interface VerifyUserDTO {
  email: string
  verificationToken: string
}

@Controller('/user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto)
  }

  @Get('/:email')
  async findByEmail(@Param('email') email: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email)
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        )
      }
      return user
    } catch (error) {
      throw new HttpException(
        ErrorMessages.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @UseGuards(AuthGuard, AccountTypeGuard)
  @Post('/delete/:email')
  @SetMetadata('accountType', AccountTypeEnum.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('email') email: string): Promise<string> {
    try {
      const user = await this.usersService.findByEmail(email)
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        )
      }
      await this.usersService.deleteByEmail(email)
      return 'User deleted successfully'
    } catch (error) {
      throw new HttpException(
        ErrorMessages.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post('/reset-password')
  resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO) {
    return this.usersService.resetPassword(resetPasswordDTO)
  }

  @Post('/send-reset-password-email')
  sendResetPasswordEmail(@Body() { email }: { email: string }) {
    return this.usersService.sendResetPasswordEmail(email)
  }

  @Post('/send-verification-email')
  sendVerificationEmail(@Body() verifyUser: SignInDto) {
    return this.usersService.sendVerificationEmail(verifyUser)
  }

  @Post('/verify')
  verify(@Body() verifyUser: VerifyUserDTO) {
    return this.usersService.verifyUser(verifyUser)
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
