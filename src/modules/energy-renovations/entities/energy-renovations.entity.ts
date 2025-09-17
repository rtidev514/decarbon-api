export class EnergyRenovationEntity {
  id: number
  email?: string
  additional_insulation_walls?: number
  additional_insulation_floors?: number
  additional_insulation_ceilings?: number
  heating_method_after_renovation?: string
  air_source_pump_after_renovation?: string
  solar_panels_after_renovation?: Record<string, string>
  install_new_window?: string
  install_new_door?: string
  sealing_after_renovation?: string
  install_new_ventilation_system?: string
  created_at: string
  updated_at: string
}
