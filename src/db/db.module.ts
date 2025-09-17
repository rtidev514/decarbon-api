import { Pool, types } from 'pg'
import { PG_CONNECTION } from 'src/util/constants'

import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

const dbProvider = {
  provide: PG_CONNECTION,
  useFactory: async (configService: ConfigService) => {
    const numericOid = 1700
    types.setTypeParser(numericOid, (val) => parseFloat(val))

    const pool = new Pool({
      user: configService.get('POSTGRES_USER'),
      host: configService.get('POSTGRES_HOST'),
      database: configService.get('POSTGRES_DB'),
      password: configService.get('POSTGRES_PASSWORD'),
      port: Number(configService.get('POSTGRES_PORT')),
    })

    const client = await pool.connect()

    try {
      const selectAllUsers = await client.query(`
        SELECT * FROM users;
      `)
      if (selectAllUsers.fields && selectAllUsers.rowCount === 0) {
        await client.query(`
            INSERT INTO users (email, username, password, status, account_type, refresh_token, verified, verification_token, new_password_token)
            VALUES ('test1@email.com', 'Full Name', 'U2FsdGVkX1+94qBbKOybIrwROyHXjfXc73MXlMmtM24=', 'active', 'super_admin', null, true, null, null);
        `)
      }
    } catch (err) {
      if (err.code === '42P01') {
        await client.query(`
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email varchar(100) UNIQUE NOT NULL,
            username varchar(255),
            password varchar(255) NOT NULL,
            status varchar(50) NOT NULL DEFAULT 'active',
            account_type varchar(255) NOT NULL,
            refresh_token text,
            verified BOOLEAN DEFAULT FALSE NOT NULL,
            verification_token text UNIQUE,
            new_password_token text UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
          );
        `)
        await client.query(`
            INSERT INTO users (email, username, password, status, account_type, refresh_token, verified, verification_token, new_password_token)
            VALUES ('test1@email.com', 'Full Name', 'U2FsdGVkX1+94qBbKOybIrwROyHXjfXc73MXlMmtM24=', 'active', 'super_admin', null, true, null, null);
          `)
        await client.query(`
            CREATE TABLE home (
              id SERIAL PRIMARY KEY,
              email VARCHAR(100) NOT NULL,
              address VARCHAR(255),
              postal_code VARCHAR(20),
              construction_year INTEGER,
              heated_surface_area NUMERIC,
              number_of_floors INTEGER,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
            );
          `)
        await client.query(`
            CREATE TABLE current_consumption (
              id SERIAL PRIMARY KEY,
              email VARCHAR(100) NOT NULL,
              known_consumption TEXT[],
              main_heating_mode VARCHAR(50),
              mechanical_ventilation VARCHAR(50),
              heat_recovery_from_mv VARCHAR(50),
              u_values_home_structure JSONB,
              thermal_insulation_thickness JSONB,
              air_leakage_rate NUMERIC,
              air_source_heat_pump VARCHAR(10),
              solar_panels VARCHAR(10),
              annual_production_solar_panels NUMERIC,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
            );
          `)
        await client.query(`
            CREATE TABLE energy_renovation (
              id SERIAL PRIMARY KEY,
              email VARCHAR(100) NOT NULL,
              additional_insulation_walls NUMERIC,
              additional_insulation_floors NUMERIC,
              additional_insulation_ceilings NUMERIC,
              heating_method_after_renovation VARCHAR(50),
              air_source_pump_after_renovation VARCHAR(10),
              solar_panels_after_renovation JSONB,
              install_new_window VARCHAR(50),
              install_new_door VARCHAR(50),
              sealing_after_renovation VARCHAR(50),
              install_new_ventilation_system VARCHAR(50),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
            );
          `)
      }
    } finally {
      client.release()
    }

    return pool
  },
  inject: [ConfigService],
}
@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DbModule {}
