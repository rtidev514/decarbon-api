import { Pool, QueryResult } from 'pg'
import { PG_CONNECTION } from 'src/util/constants'

import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { AnswerHomeDetailsDto } from './dto/answer-home-details.dto'

@Injectable()
export class HomeDetailsService {
  constructor(
    @Inject(PG_CONNECTION) private conn: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async answerHomeDetails(
    answerHomeDetailsDto: AnswerHomeDetailsDto,
  ): Promise<AnswerHomeDetailsDto> {
    const {
      email,
      address,
      postal_code,
      construction_year,
      heated_surface_area,
      number_of_floors,
    } = answerHomeDetailsDto

    if (!email) {
      throw new BadRequestException('Email is required')
    }

    try {
      // Check if a record exists
      const checkQuery = 'SELECT * FROM home WHERE email = $1'
      const checkResult: QueryResult = await this.conn.query(checkQuery, [
        email,
      ])

      if (checkResult.rows.length > 0) {
        const fieldsToUpdate: string[] = []
        const values: any[] = []

        if (address !== undefined) {
          fieldsToUpdate.push('address = $' + (values.length + 1))
          values.push(address)
        }
        if (postal_code !== undefined) {
          fieldsToUpdate.push('postal_code = $' + (values.length + 1))
          values.push(postal_code)
        }
        if (construction_year !== undefined) {
          fieldsToUpdate.push('construction_year = $' + (values.length + 1))
          values.push(construction_year)
        }
        if (heated_surface_area !== undefined) {
          fieldsToUpdate.push('heated_surface_area = $' + (values.length + 1))
          values.push(heated_surface_area)
        }
        if (number_of_floors !== undefined) {
          fieldsToUpdate.push('number_of_floors = $' + (values.length + 1))
          values.push(number_of_floors)
        }

        if (fieldsToUpdate.length > 0) {
          fieldsToUpdate.push('updated_at = now()')
          const updateQuery = `UPDATE home SET ${fieldsToUpdate.join(', ')} WHERE email = $${
            values.length + 1
          } RETURNING *` // Return updated row
          values.push(email)

          const updatedResult: QueryResult = await this.conn.query(
            updateQuery,
            values,
          )
          return updatedResult.rows[0] // Return updated home row
        }

        return checkResult.rows[0] // Return existing row if no updates were made
      }

      // Insert only non-null fields
      const columns: string[] = ['email']
      const placeholders: string[] = ['$1']
      const insertValues: any[] = [email]

      if (address !== undefined) {
        columns.push('address')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(address)
      }
      if (postal_code !== undefined) {
        columns.push('postal_code')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(postal_code)
      }
      if (construction_year !== undefined) {
        columns.push('construction_year')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(construction_year)
      }
      if (heated_surface_area !== undefined) {
        columns.push('heated_surface_area')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(heated_surface_area)
      }
      if (number_of_floors !== undefined) {
        columns.push('number_of_floors')
        placeholders.push(`$${insertValues.length + 1}`)
        insertValues.push(number_of_floors)
      }

      const insertQuery = `INSERT INTO home (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`
      const insertResult: QueryResult = await this.conn.query(
        insertQuery,
        insertValues,
      )

      return insertResult.rows[0] // Return newly inserted home row
    } catch (error) {
      throw new Error('Error processing home details: ' + error.message)
    }
  }
}
