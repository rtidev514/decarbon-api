export class CurrentConsumptionEntity {
  id: number
  email?: string
  known_consumption?: string[]
  main_heating_mode?: string
  mechanical_ventilation?: string
  heat_recovery_from_mv?: string
  u_values_home_structure?: Record<string, string>
  thermal_insulation_thickness?: Record<string, string>
  air_leakage_rate?: number
  air_source_heat_pump?: string
  solar_panels?: string
  annual_production_solar_panels?: number
  created_at: string
  updated_at: string
}
