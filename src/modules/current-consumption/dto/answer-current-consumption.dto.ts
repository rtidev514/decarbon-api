import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'

export class CurrentConsumptionDto {
  @IsString()
  email: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  known_consumption?: string[]

  @IsOptional()
  @IsString()
  main_heating_mode?: string

  @IsOptional()
  @IsString()
  mechanical_ventilation?: string

  @IsOptional()
  @IsString()
  heat_recovery_from_mv?: string

  @IsOptional()
  @IsObject()
  u_values_home_structure?: Record<string, string>

  @IsOptional()
  @IsObject()
  thermal_insulation_thickness?: Record<string, string>

  @IsOptional()
  @IsNumber()
  air_leakage_rate?: number

  @IsOptional()
  @IsString()
  air_source_heat_pump?: string

  @IsOptional()
  @IsString()
  solar_panels?: string

  @IsOptional()
  @IsNumber()
  annual_production_solar_panels?: number
}
