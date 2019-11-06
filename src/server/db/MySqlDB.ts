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
    const groupByMonths = '%m/%Y';

    // find all relevant blocks data
    const relevantBlockData = await this.fetchLatestBlocksDataForRange(0, groupByMonths);

    const query =  `Select recipient, in_orbs(get_stake(recipient))
                    FROM (SELECT source as recipient FROM transfers
                    UNION
                    SELECT recipient FROM transfers) all_unique_addresses
                    order by get_stake(recipient) desc
                    limit 30`;

    const dbRes = await this.mappedQuery<{name: string}>(query, row => {
      return {
        name: row.recipient,
      };
    });

    return dbRes;
  }

  /**
   * returns data about the latest block for each given time unit since the given start timestamp.
   */
  private async fetchLatestBlocksDataForRange(startingTimeStamp: number, dateGroupFormat: string) {
    const query = ` SELECT MAX(block) as blockNumber, MAX(blockTime) as blockTime, DATE_FORMAT(FROM_UNIXTIME(blockTime), ?) as date
                    FROM transfers
                    WHERE blockTime > ?
                    GROUP BY DATE_FORMAT(FROM_UNIXTIME(blockTime), ?)
                    ORDER BY blockTime DESC;
    `;

    const values = [dateGroupFormat, startingTimeStamp, dateGroupFormat];

    const blocksData = await this.mappedQuery<{ blockNumber: number, blockTime: number, readableDate: string }>(query, row => {
      return {
        blockNumber: row.blockNumber,
        blockTime: row.blockTime,
        readableDate: row.date
      };
    }, values);

    return blocksData;
  }

  private buildConnection( host: string, user: string, password: string, database: string)  {
    this.logger.info('Building MySQL connection');

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
        this.logger.warn('MySql connection lost, will try to rebuild connection.');
        this.buildConnection(host, user, password, host);   // lost due to either server restart, or a
      } else {                                        // connection idle timeout (the wait_timeout
        this.logger.error(`error code : ${err.code}`);
        throw err;                                    // server variable configures this)
      }
    });

    this.dbConnection = connection;
  }

  private async query(queryStr: string, values?: any[]): Promise<any> {
    return new Promise(((resolve, reject) => {
      this.dbConnection.query(queryStr, values, (err, dbRows) => {
        if (err) {
          return reject(err);
        }

        return resolve(dbRows);
      });
    }));
  }

  private async mappedQuery<T>(queryStr: string, rowsMapper?: (row: any) => T,  values?: any[] ): Promise<T[]> {
    const dbRes = await this.query(queryStr, values);

    const results = dbRes.map(row => rowsMapper(row));

    return results;
  }

}
