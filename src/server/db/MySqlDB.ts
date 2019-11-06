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

import {Connection, createConnection} from 'mysql';

pg.types.setTypeParser(20, 'text', parseInt);
pg.types.setTypeParser(1700, parseFloat);

export class MySqlDB implements IDB {
  private dbConnection: Connection;

  constructor(private logger: winston.Logger, private host: string, private user: string, private password: string, private database: string) {
    // this.buildConnection(host, user, password);
  }

  public async rebuild(): Promise<void> {
    // await this.query(`drop schema public cascade;`);
    // await this.query(`create schema public;`);

    // EXAMPLE //
    // await this.query(`
    // CREATE TABLE some_data (
    //   name text,
    //   age numeric
    // );`);
  }

  public async init(): Promise<void> {
    return  this.buildConnection(this.host, this.user, this.password, this.database);
  }

  public async destroy(): Promise<void> {
    await this.dbConnection.end();
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

  public async getTopTokenHolders() {
    const query = `select recipient, in_orbs(get_stake(recipient))
from (SELECT source as recipient FROM transfers
    UNION
    SELECT recipient FROM transfers) all_unique_addresses
order by get_stake(recipient) desc
limit 20`;

    return new Promise((res, reject) => {
      this.dbConnection.query(query, (err, results) => {
        if (err) {

          return reject(err);
        }

        console.warn('results', results);
        res(results);
      });
    });
  }

  private buildConnection( host: string, user: string, password: string, database: string)  {
    const connection = createConnection({
      host,
      user,
      password,
      database
    });

    connection.connect(err => {
      if (err) {
        this.logger.error(`Failed connecting to MySql server: ${err}`);
        throw err;
      }
    });

    connection.on('error', err => {
      this.logger.error(`db error ${err}`);

      if (err.code === 'PROTOCOL_CONNECTION_LOST') {   // Connection to the MySQL server is usually
        this.logger.error('Ay ya yay');
        this.buildConnection(host, user, password, host);   // lost due to either server restart, or a
      } else {                                        // connection idle timeout (the wait_timeout
        this.logger.error(`error code : ${err.code}`)
        throw err;                                    // server variable configures this)
      }
    });

    this.dbConnection = connection;
  }

  private async query(queryStr: string, values?: any[]): Promise<any> {
    // const client: pg.PoolClient = await this.pool.connect();
    // try {
    //   const result: pg.QueryResult = await client.query(queryStr, values);
    //   return result.rows;
    // } catch (e) {
    //   console.log(`Query error: ${e} query:${queryStr}`);
    //   throw e;
    // } finally {
    //   client.release();
    // }
  }
}
