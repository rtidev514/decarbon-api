import { IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
  @IsString()
  email: string

  @IsOptional()
  @IsString()
  username: string

  @IsString()
  password: string
}
