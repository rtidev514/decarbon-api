import nodemailer from 'nodemailer'
import { Pool, QueryResult } from 'pg'
import { decryptPassword } from 'src/auth/auth.service'
import { SignInDto } from 'src/auth/dto/sign-in.dto'
import {
  ErrorMessages,
  SimpleMessages,
  SuccessMessages,
} from 'src/common/app-messages'
import { PG_CONNECTION } from 'src/util/constants'

import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { CreateUserDto } from './dto/create-user.dto'
import { UserEntity } from './entities/user.entity'
import { ResetPasswordDTO, VerifyUserDTO } from './users.controller'

@Injectable()
export class UsersService {
  constructor(
    @Inject(PG_CONNECTION) private conn: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async createAccessToken(userId: number, email: string, accountType: string) {
    const payload = {
      sub: userId,
      email: email,
      accountType: accountType,
    }

    return await this.jwtService.signAsync(payload, { expiresIn: '7d' })
  }

  async createRefreshToken(userId: number, email: string, accountType: string) {
    const payload = {
      sub: userId,
      email: email,
      accountType: accountType,
    }

    return await this.jwtService.signAsync(payload, { expiresIn: '7d' })
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: process.env.SERVER_EMAIL_SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SERVER_EMAIL_USER,
        pass: process.env.SERVER_EMAIL_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.SERVER_EMAIL_USER,
      to: to,
      subject,
      html,
    }

    try {
      await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error(ErrorMessages.ERROR_SENDING_EMAIL, error)
      throw error
    }
  }

  async createUser(createUserDTO: CreateUserDto): Promise<string> {
    const existingUser = await this.findByEmail(createUserDTO.email)
    if (existingUser) {
      throw new BadRequestException(ErrorMessages.BAD_REQUEST)
    }

    const queryText = `
      INSERT INTO users (email, password, account_type, refresh_token, verified, verification_token, username)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    const values = [
      createUserDTO.email,
      createUserDTO.password,
      'user',
      null,
      false,
      null,
      createUserDTO.username,
    ]
    const result: QueryResult = await this.conn.query<UserEntity>(
      queryText,
      values,
    )
    const newUser = result.rows[0]

    const verificationToken = await this.createAccessToken(
      newUser.id,
      newUser.email,
      newUser.account_type,
    )

    await this.conn.query(
      'UPDATE users SET verification_token = $1 WHERE id = $2',
      [verificationToken, newUser.id],
    )

    const verificationUrl = `${process.env.EMAIL_CONFIRMATION_URL}${verificationToken}`

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #342B60; text-align: center;">Kiitos rekisteröitymisestä!</h2>
          <p style="font-size: 16px; text-align: center;">Vahvista sähköpostiosoitteesi napsauttamalla alla olevaa linkkiä:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #342B60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vahvista sähköpostiosoitteesi</a>
          </div>
          <p style="font-size: 14px; color: #555;">Jos et ole rekisteröitynyt, jätä tämä sähköposti huomiotta.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2025 Kaikki oikeudet pidätetään.</p>
        </div>
      </div>
    `

    await this.sendEmail(
      createUserDTO.email,
      'Vahvista sähköpostiosoite',
      emailHtml,
    )

    return verificationToken
  }

  async deleteByEmail(email: string): Promise<void> {
    const deleteHomeDetailsQuery = 'DELETE FROM public.home WHERE email = $1'
    const deleteUserQuery = 'DELETE FROM users WHERE email = $1'
    const values = [email]

    try {
      await this.conn.query('BEGIN')
      await this.conn.query(deleteHomeDetailsQuery, values)
      await this.conn.query(deleteUserQuery, values)
      await this.conn.query('COMMIT')
    } catch (error) {
      await this.conn.query('ROLLBACK')
      throw error
    }
  }

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    const queryText = 'SELECT * FROM users WHERE email = $1'
    const values = [email]
    const result: QueryResult = await this.conn.query(queryText, values)
    const existingUser: UserEntity = result.rows[0]
    return existingUser
  }

  async findById(id: number): Promise<UserEntity | undefined> {
    const queryText = 'SELECT * FROM users WHERE id = $1'
    const values = [id]
    const result: QueryResult = await this.conn.query(queryText, values)
    const existingUser: UserEntity = result.rows[0]
    return existingUser
  }

  async getAdminUsers(): Promise<UserEntity[]> {
    const queryText =
      'SELECT * FROM users WHERE account_type IN ($1, $2) ORDER BY id'
    const values = ['admin', 'super_admin']
    const result: QueryResult = await this.conn.query(queryText, values)
    return result.rows as UserEntity[]
  }

  async resetPassword(resetPasswordDTO: ResetPasswordDTO): Promise<string> {
    const userWithToken = await this.conn.query(
      'SELECT * FROM users WHERE new_password_token = $1',
      [resetPasswordDTO.newPasswordToken],
    )
    if (userWithToken.rows.length === 0) {
      throw new BadRequestException('Token is not valid, request a new email')
    }
    const queryText =
      'UPDATE users SET password = $1, new_password_token = $2 WHERE id = $3'
    const values = [resetPasswordDTO.password, null, userWithToken.rows[0].id]
    await this.conn.query<UserEntity>(queryText, values)
    return SuccessMessages.PASSWORD_RESET_SUCCESSFULLY
  }

  async sendResetPasswordEmail(email: string): Promise<string> {
    const user = await this.findByEmail(email)
    if (!user) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND)
    }
    const newPasswordToken = await this.createAccessToken(
      user.id,
      user.email,
      user.account_type,
    )
    const queryText = 'UPDATE users SET new_password_token = $1 WHERE id = $2'
    const values = [newPasswordToken, user.id]
    await this.conn.query<UserEntity>(queryText, values)

    const resetPasswordUrl = `${process.env.RESET_PASSWORD_CONFIRMATION_URL}${newPasswordToken}`

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #fff; padding: 40px 0;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #9393FE; border-radius: 10px; background-color: white; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #7C82D6; text-align: center; margin-bottom: 10px;">Salasanan palautuspyyntö</h2>
          <p style="font-size: 16px; text-align: center; color: #555;">Saimme pyynnön salasanasi vaihtamisesta. Jatka napsauttamalla alla olevaa painiketta:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetPasswordUrl}" style="background-color: #7C82D6; color: white; padding: 12px 24px; font-size: 16px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);">Palauta salasanasi</a>
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">Jos et pyytänyt salasanan vaihtoa, voit turvallisesti jättää tämän sähköpostin huomiotta.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2025 Kaikki oikeudet pidätetään.</p>
        </div>
      </div>
    `

    await this.sendEmail(email, 'Reset your password', emailHtml)

    return SuccessMessages.PASSWORD_RESET_EMAIL_SENT
  }

  async sendVerificationEmail(
    sendVerificationEmailDTO: SignInDto,
  ): Promise<string> {
    const user = await this.findByEmail(sendVerificationEmailDTO.email)
    if (!user) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND)
    }
    if (user?.verified === true) {
      throw new BadRequestException(ErrorMessages.EMAIL_ALREADY_VERIFIED)
    }
    if (
      decryptPassword(user?.password) !==
      decryptPassword(sendVerificationEmailDTO?.password)
    ) {
      throw new BadRequestException(ErrorMessages.INCORRECT_CREDENTIALS)
    }
    const newVerificationToken = await this.createAccessToken(
      user.id,
      user.email,
      user.account_type,
    )
    const queryText = 'UPDATE users SET verification_token = $1 WHERE id = $2'
    const values = [newVerificationToken, user.id]
    await this.conn.query<UserEntity>(queryText, values)

    const verificationUrl = `${process.env.EMAIL_CONFIRMATION_URL}${newVerificationToken}`

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #342B60; text-align: center;">Kiitos rekisteröitymisestä!</h2>
          <p style="font-size: 16px; text-align: center;">Vahvista sähköpostiosoitteesi napsauttamalla alla olevaa linkkiä:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #342B60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vahvista sähköpostiosoitteesi</a>
          </div>
          <p style="font-size: 14px; color: #555;">Jos et ole rekisteröitynyt, jätä tämä sähköposti huomiotta.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2025 Kaikki oikeudet pidätetään.</p>
        </div>
      </div>
    `

    await this.sendEmail(user.email, 'Vahvista sähköpostiosoite', emailHtml)

    return SimpleMessages.VERIFICATION_EMAIL_SENT
  }

  async validateRefreshToken(refreshTokenToValidate: string): Promise<boolean> {
    const userWithToken = await this.conn.query(
      'SELECT * FROM users WHERE refresh_token = $1',
      [refreshTokenToValidate],
    )
    if (userWithToken.rows.length === 0) {
      throw new UnauthorizedException()
    }
    return true
  }

  async verifyUser(verifyUser: VerifyUserDTO): Promise<boolean> {
    const existingUser = await this.findByEmail(verifyUser.email)

    if (!existingUser) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND)
    }

    if (verifyUser.verificationToken !== existingUser.verification_token) {
      throw new BadRequestException(ErrorMessages.INCORRECT_VERIFICATION_TOKEN)
    }

    const queryText =
      'UPDATE users SET verification_token = $1, verified = $2 WHERE id = $3'
    const values: [null, boolean, number] = [null, true, existingUser.id]

    try {
      await this.conn.query<UserEntity>(queryText, values)
    } catch (error) {
      console.error(ErrorMessages.ERROR_EXECUTING_QUERY, error)
      throw new Error(ErrorMessages.DATABASE_ERROR)
    }

    return true
  }
}
