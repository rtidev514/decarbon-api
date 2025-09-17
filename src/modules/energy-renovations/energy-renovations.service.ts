import { Pool, QueryResult } from 'pg'
import { PG_CONNECTION } from 'src/util/constants'

import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { EnergyRenovationDto } from './dto/answer-energy-renovations.dto'

@Injectable()
export class EnergyRenovationService {
  constructor(
    @Inject(PG_CONNECTION) private conn: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async answerEnergyRenovation(
    energyRenovationDto: EnergyRenovationDto,
  ): Promise<EnergyRenovationDto> {
    const {
      email,
      additional_insulation_walls,
      additional_insulation_floors,
      additional_insulation_ceilings,
      heating_method_after_renovation,
      air_source_pump_after_renovation,
      solar_panels_after_renovation,
      install_new_window,
      install_new_door,
      sealing_after_renovation,
      install_new_ventilation_system,
    } = energyRenovationDto

    if (!email) {
      throw new BadRequestException('Email is required')
    }

    try {
      // Check if a record exists
      const checkQuery = 'SELECT * FROM energy_renovation WHERE email = $1'
      const checkResult: QueryResult = await this.conn.query(checkQuery, [
        email,
      ])

      if (checkResult.rows.length > 0) {
        const fieldsToUpdate: string[] = []
        const values: any[] = []

        if (additional_insulation_walls !== undefined) {
          fieldsToUpdate.push(
            'additional_insulation_walls = $' + (values.length + 1),
          )
          values.push(additional_insulation_walls)
        }
        if (additional_insulation_floors !== undefined) {
          fieldsToUpdate.push(
            'additional_insulation_floors = $' + (values.length + 1),
          )
          values.push(additional_insulation_floors)
        }
        if (additional_insulation_ceilings !== undefined) {
          fieldsToUpdate.push(
            'additional_insulation_ceilings = $' + (values.length + 1),
          )
          values.push(additional_insulation_ceilings)
        }
        if (heating_method_after_renovation !== undefined) {
          fieldsToUpdate.push(
            'heating_method_after_renovation = $' + (values.length + 1),
          )
          values.push(heating_method_after_renovation)
        }
        if (air_source_pump_after_renovation !== undefined) {
          fieldsToUpdate.push(
            'air_source_pump_after_renovation = $' + (values.length + 1),
          )
          values.push(air_source_pump_after_renovation)
        }
        if (solar_panels_after_renovation !== undefined) {
          fieldsToUpdate.push(
            'solar_panels_after_renovation = $' +
              (values.length + 1) +
              '::jsonb',
          )
          values.push(solar_panels_after_renovation)
        }
        if (install_new_window !== undefined) {
          fieldsToUpdate.push('install_new_window = $' + (values.length + 1))
          values.push(install_new_window)
        }
        if (install_new_door !== undefined) {
          fieldsToUpdate.push('install_new_door = $' + (values.length + 1))
          values.push(install_new_door)
        }
        if (sealing_after_renovation !== undefined) {
          fieldsToUpdate.push(
            'sealing_after_renovation = $' + (values.length + 1),
          )
          values.push(sealing_after_renovation)
        }
        if (install_new_ventilation_system !== undefined) {
          fieldsToUpdate.push(
            'install_new_ventilation_system = $' + (values.length + 1),
          )
          values.push(install_new_ventilation_system)
        }

        if (fieldsToUpdate.length > 0) {
          fieldsToUpdate.push('updated_at = now()')
          const updateQuery = `
            UPDATE energy_renovation
            SET ${fieldsToUpdate.join(', ')}
            WHERE email = $${values.length + 1}
            RETURNING *
          `
          values.push(email)

          const updatedResult: QueryResult = await this.conn.query(
            updateQuery,
            values,
          )
          return updatedResult.rows[0]
        }

        return checkResult.rows[0]
      }

      // Insert only non-null fields
      const columns: string[] = ['email']
      const placeholders: string[] = ['$1']
      const insertValues: any[] = [email]

      if (additional_insulation_walls !== undefined) {
        columns.push('additional_insulation_walls')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(additional_insulation_walls)
      }
      if (additional_insulation_floors !== undefined) {
        columns.push('additional_insulation_floors')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(additional_insulation_floors)
      }
      if (additional_insulation_ceilings !== undefined) {
        columns.push('additional_insulation_ceilings')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(additional_insulation_ceilings)
      }
      if (heating_method_after_renovation !== undefined) {
        columns.push('heating_method_after_renovation')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(heating_method_after_renovation)
      }
      if (air_source_pump_after_renovation !== undefined) {
        columns.push('air_source_pump_after_renovation')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(air_source_pump_after_renovation)
      }
      if (solar_panels_after_renovation !== undefined) {
        columns.push('solar_panels_after_renovation')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(solar_panels_after_renovation)
      }
      if (install_new_window !== undefined) {
        columns.push('install_new_window')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(install_new_window)
      }
      if (install_new_door !== undefined) {
        columns.push('install_new_door')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(install_new_door)
      }
      if (sealing_after_renovation !== undefined) {
        columns.push('sealing_after_renovation')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(sealing_after_renovation)
      }
      if (install_new_ventilation_system !== undefined) {
        columns.push('install_new_ventilation_system')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(install_new_ventilation_system)
      }

      const insertQuery = `INSERT INTO energy_renovation (${columns.join(
        ', ',
      )}) VALUES (${placeholders.join(', ')}) RETURNING *`

      const insertResult: QueryResult = await this.conn.query(
        insertQuery,
        insertValues,
      )
      return insertResult.rows[0]
    } catch (error) {
      throw new Error('Error processing energy renovation: ' + error.message)
    }
  }
}
