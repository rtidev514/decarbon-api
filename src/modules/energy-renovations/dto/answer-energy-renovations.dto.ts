import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

export class EnergyRenovationDto {
  @IsString()
  email: string

  @IsOptional()
  @IsNumber()
  additional_insulation_walls?: number

  @IsOptional()
  @IsNumber()
  additional_insulation_floors?: number

  @IsOptional()
  @IsNumber()
  additional_insulation_ceilings?: number

  @IsOptional()
  @IsString()
  heating_method_after_renovation?: string

  @IsOptional()
  @IsString()
  air_source_pump_after_renovation?: string

  @IsOptional()
  @IsObject()
  solar_panels_after_renovation?: Record<string, string>

  @IsOptional()
  @IsString()
  install_new_window?: string

  @IsOptional()
  @IsString()
  install_new_door?: string

  @IsOptional()
  @IsString()
  sealing_after_renovation?: string

  @IsOptional()
  @IsString()
  install_new_ventilation_system?: string
}
