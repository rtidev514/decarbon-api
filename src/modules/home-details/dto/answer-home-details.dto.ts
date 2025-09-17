import { IsNumber, IsOptional, IsString } from 'class-validator'

export class AnswerHomeDetailsDto {
  @IsString()
  email: string

  @IsOptional()
  @IsString()
  address: string

  @IsOptional()
  @IsString()
  postal_code: string

  @IsOptional()
  @IsNumber()
  construction_year: number

  @IsOptional()
  @IsNumber()
  heated_surface_area: number

  @IsOptional()
  @IsNumber()
  number_of_floors: number
}
