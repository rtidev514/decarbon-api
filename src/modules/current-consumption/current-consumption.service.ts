import { Pool, QueryResult } from 'pg'
import { PG_CONNECTION } from 'src/util/constants'

import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { CurrentConsumptionDto } from './dto/answer-current-consumption.dto'

@Injectable()
export class CurrentConsumptionService {
  constructor(
    @Inject(PG_CONNECTION) private conn: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async answerCurrentConsumption(
    currentConsumptionDto: CurrentConsumptionDto,
  ): Promise<CurrentConsumptionDto> {
    const {
      email,
      known_consumption,
      main_heating_mode,
      mechanical_ventilation,
      heat_recovery_from_mv,
      u_values_home_structure,
      thermal_insulation_thickness,
      air_leakage_rate,
      air_source_heat_pump,
      solar_panels,
      annual_production_solar_panels,
    } = currentConsumptionDto

    if (!email) {
      throw new BadRequestException('Email is required')
    }

    try {
      // Check if a record exists
      const checkQuery = 'SELECT * FROM current_consumption WHERE email = $1'
      const checkResult: QueryResult = await this.conn.query(checkQuery, [
        email,
      ])

      if (checkResult.rows.length > 0) {
        const fieldsToUpdate: string[] = []
        const values: any[] = []

        if (known_consumption !== undefined) {
          fieldsToUpdate.push('known_consumption = $' + (values.length + 1))
          values.push(known_consumption)
        }
        if (main_heating_mode !== undefined) {
          fieldsToUpdate.push('main_heating_mode = $' + (values.length + 1))
          values.push(main_heating_mode)
        }
        if (mechanical_ventilation !== undefined) {
          fieldsToUpdate.push(
            'mechanical_ventilation = $' + (values.length + 1),
          )
          values.push(mechanical_ventilation)
        }
        if (heat_recovery_from_mv !== undefined) {
          fieldsToUpdate.push('heat_recovery_from_mv = $' + (values.length + 1))
          values.push(heat_recovery_from_mv)
        }
        if (u_values_home_structure !== undefined) {
          fieldsToUpdate.push(
            'u_values_home_structure = $' + (values.length + 1) + '::jsonb',
          )
          values.push(u_values_home_structure)
        }
        if (thermal_insulation_thickness !== undefined) {
          fieldsToUpdate.push(
            'thermal_insulation_thickness = $' +
              (values.length + 1) +
              '::jsonb',
          )
          values.push(thermal_insulation_thickness)
        }
        if (air_leakage_rate !== undefined) {
          fieldsToUpdate.push('air_leakage_rate = $' + (values.length + 1))
          values.push(air_leakage_rate)
        }
        if (air_source_heat_pump !== undefined) {
          fieldsToUpdate.push('air_source_heat_pump = $' + (values.length + 1))
          values.push(air_source_heat_pump)
        }
        if (solar_panels !== undefined) {
          fieldsToUpdate.push('solar_panels = $' + (values.length + 1))
          values.push(solar_panels)
        }
        if (annual_production_solar_panels !== undefined) {
          fieldsToUpdate.push(
            'annual_production_solar_panels = $' + (values.length + 1),
          )
          values.push(annual_production_solar_panels)
        }

        if (fieldsToUpdate.length > 0) {
          fieldsToUpdate.push('updated_at = now()')
          const updateQuery = `
      UPDATE current_consumption
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

      if (known_consumption !== undefined) {
        columns.push('known_consumption')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(known_consumption)
      }
      if (main_heating_mode !== undefined) {
        columns.push('main_heating_mode')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(main_heating_mode)
      }
      if (mechanical_ventilation !== undefined) {
        columns.push('mechanical_ventilation')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(mechanical_ventilation)
      }
      if (heat_recovery_from_mv !== undefined) {
        columns.push('heat_recovery_from_mv')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(heat_recovery_from_mv)
      }
      if (u_values_home_structure !== undefined) {
        columns.push('u_values_home_structure')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(u_values_home_structure)
      }
      if (thermal_insulation_thickness !== undefined) {
        columns.push('thermal_insulation_thickness')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(thermal_insulation_thickness)
      }
      if (air_leakage_rate !== undefined) {
        columns.push('air_leakage_rate')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(air_leakage_rate)
      }
      if (air_source_heat_pump !== undefined) {
        columns.push('air_source_heat_pump')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(air_source_heat_pump)
      }
      if (solar_panels !== undefined) {
        columns.push('solar_panels')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(solar_panels)
      }
      if (annual_production_solar_panels !== undefined) {
        columns.push('annual_production_solar_panels')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(annual_production_solar_panels)
      }

      const insertQuery = `INSERT INTO current_consumption (${columns.join(
        ', ',
      )}) VALUES (${placeholders.join(', ')}) RETURNING *`
      const insertResult: QueryResult = await this.conn.query(
        insertQuery,
        insertValues,
      )

      return insertResult.rows[0]
    } catch (error) {
      throw new Error('Error processing current consumption: ' + error.message)
    }
  }
}
