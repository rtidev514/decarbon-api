import CryptoJS from 'crypto-js'
import { jwtDecode } from 'jwt-decode'
import { ErrorMessages } from 'src/common/app-messages'
import { SignInDto } from 'src/auth/dto/sign-in.dto'
import { UsersService } from 'src/modules/users/users.service'
import { PG_CONNECTION } from 'src/util/constants'

import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

export type DecodedToken = {
  sub: number
  accountType: string
  email: string
  username: string
  exp: number
}

export const decryptPassword = (encryptedPassword: string) => {
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(
      encryptedPassword,
      process.env.CRYPTO_KEY,
    )
    const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8)
    return decryptedPassword
  } catch (error) {
    throw new Error(ErrorMessages.FAILED_DECRYPT_PASS)
  }
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(PG_CONNECTION) private conn: any,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
  ) {}
  async createAccessToken(
    userId: number,
    email: string,
    username: string,
    accountType: string,
  ) {
    const payload = {
      sub: userId,
      email: email,
      username: username,
      accountType: accountType,
    }

    return await this.jwtService.signAsync(payload, { expiresIn: '7d' })
  }

  async createRefreshToken(
    userId: number,
    email: string,
    username: string,
    accountType: string,
  ) {
    const payload = {
      sub: userId,
      email: email,
      username: username,
      accountType: accountType,
    }

    return await this.jwtService.signAsync(payload, { expiresIn: '7d' })
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const existingRefreshToken =
      await this.usersService.validateRefreshToken(refreshToken)
    if (existingRefreshToken) {
      const decodedToken: DecodedToken = jwtDecode(refreshToken)
      const isExpired = new Date(decodedToken.exp! * 1000) <= new Date()
      if (isExpired) {
        throw new UnauthorizedException()
      }
      if (!isExpired) {
        const newRefreshToken = await this.createRefreshToken(
          decodedToken.sub,
          decodedToken.email,
          decodedToken.username,
          decodedToken.accountType,
        )
        const newAccessToken = await this.createAccessToken(
          decodedToken.sub,
          decodedToken.email,
          decodedToken.username,
          decodedToken.accountType,
        )
        await this.conn.query(
          'UPDATE users SET refresh_token = $1 WHERE id = $2',
          [newRefreshToken, decodedToken.sub],
        )
        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        }
      }
    }
  }

  async signIn(
    signInDTO: SignInDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findByEmail(signInDTO.email)
    if (!user) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND)
    }
    if (!user.verified) {
      throw new BadRequestException(ErrorMessages.EMAIL_NOT_VERIFIED)
    }
    if (user.status === 'inactive') {
      throw new BadRequestException(ErrorMessages.ACCOUNT_INACTIVE)
    }
    if (
      decryptPassword(user?.password) !== decryptPassword(signInDTO.password)
    ) {
      throw new BadRequestException(ErrorMessages.INCORRECT_CREDENTIALS)
    }
    const newAccessToken = await this.createAccessToken(
      user.id,
      user.email,
      user.username,
      user.account_type,
    )
    const newRefreshToken = await this.createRefreshToken(
      user.id,
      user.email,
      user.username,
      user.account_type,
    )
    await this.conn.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [
      newRefreshToken,
      user.id,
    ])

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }

  async validateUser(email: string): Promise<any> {
    return this.usersService.findByEmail(email)
  }
}
