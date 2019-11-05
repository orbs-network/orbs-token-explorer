/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import * as winston from 'winston';
import { IDB } from './IDB';
import { ISomeData } from '../../shared/ISomeData';
import * as pg from 'pg';
import * as url from 'url';

import mysql from 'mysql';

pg.types.setTypeParser(20, 'text', parseInt);
pg.types.setTypeParser(1700, parseFloat);

export class MySqlDB implements IDB {
  public pool: pg.Pool;

  constructor(private logger: winston.Logger, private connectionUrl: string) {
    this.pool = new pg.Pool(this.generateConfig());
  }

  public async rebuild(): Promise<void> {
    await this.query(`drop schema public cascade;`);
    await this.query(`create schema public;`);

    // EXAMPLE //
    await this.query(`
    CREATE TABLE some_data (
      name text,
      age numeric
    );`);
  }

  public async init(): Promise<void> {}

  public async destroy(): Promise<void> {
    await this.pool.end();
  }

  // EXAMPLE //
  public async storeSomeData(someData: ISomeData): Promise<void> {
    const { age, name } = someData;
    await this.query(`
      INSERT INTO some_data (name, age)
      VALUES (
        '${name}',
        ${age}
      );
      `);
  }

  // EXAMPLE //
  public async getSomeData(name: string): Promise<ISomeData> {
    const query = `
      SELECT age, name
      FROM some_data
      WHERE name = '${name}';
    `;

    const rows = await this.query(query);

    return rows.length === 0 ? null : rows[0];
  }

  public async getTopTokenHoldersForPastYear() {

  }

  private generateConfig(): pg.PoolConfig {
    // const params = url.parse(this.connectionUrl);
    // const auth = params.auth.split(':');
    // return {
    //   user: auth[0],
    //   password: auth[1],
    //   host: params.hostname,
    //   port: parseInt(params.port, 10),
    //   database: params.pathname.split('/')[1],
    //   ssl: process.env.NODE_ENV === 'production' || params.hostname.indexOf('.amazonaws.com') > 0,
    // };
  }

  private async query(queryStr: string, values?: any[]): Promise<any[]> {
    const client: pg.PoolClient = await this.pool.connect();
    try {
      const result: pg.QueryResult = await client.query(queryStr, values);
      return result.rows;
    } catch (e) {
      console.log(`Query error: ${e} query:${queryStr}`);
      throw e;
    } finally {
      client.release();
    }
  }
}
