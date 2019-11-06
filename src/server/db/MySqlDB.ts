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
import Moment from 'moment';

import {Connection, createConnection} from 'mysql';
import {ITopHoldersAtTime} from '../../shared/serverResponses/bi/serverBiResponses';

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
    const minHolding = 1_000_000;
    const groupByMonths = '%m/%Y';
    const startTimeStamp = Moment.utc().subtract(1, 'year').startOf('month').unix();

    // find all relevant blocks data
    const relevantBlockData = await this.fetchLatestBlocksDataForRange(startTimeStamp, groupByMonths);

    const all: ITopHoldersAtTime[] = await Promise.all(relevantBlockData.map(async blockData => {
      const topHoldersForBlock =  await this.fetchTopHoldersByBlock(blockData.blockNumber, minHolding);

      const topHOlderForTimeUnit: ITopHoldersAtTime = {
        totalTokens: blockData.totalCirculation,
        topHolders: topHoldersForBlock.map(holderForBlock => ({
          tokens: holderForBlock.tokens,
          displayName: holderForBlock.address,
          address: holderForBlock.address,
          isOrbsAddress: false
        })),
        timestamp: blockData.blockTime,
      };

      return topHOlderForTimeUnit;
    }));

    return all;
  }

  private async fetchTopHoldersByBlock(blockNumber: number, minHolding: number) {
    const query = ` SELECT recipient,
                           in_orbs(get_stake_at_block(recipient, :blockNumber)) as tokens,
                           is_guardian_at_block(recipient,:blockNumber) as isGuardian
                    FROM (SELECT source as recipient
                          FROM transfers
                          UNION
                          SELECT recipient
                          FROM transfers) all_unique_addresses
                    WHERE in_orbs(get_stake_at_block(recipient, :blockNumber)) > :minHolding
                    ORDER BY get_stake_at_block(recipient, :blockNumber) desc`;

    const values = {
      blockNumber,
      minHolding,
    };

    return this.mappedQuery<{ address: string, tokens: number, isGuardian: boolean}>(query, row => ({
      address: row.recipient,
      tokens: row.tokens,
      isGuardian: !!row.isGuardian,
    }), values);
  }

  /**
   * returns data about the latest block for each given time unit since the given start timestamp.
   */
  private async fetchLatestBlocksDataForRange(startingTimeStamp: number, dateGroupFormat: string) {
    const hardCodedOrbsInCirculation = 2_000_000_000;

    const query = ` SELECT MAX(block) as blockNumber, MAX(blockTime) as blockTime, DATE_FORMAT(FROM_UNIXTIME(blockTime), :dateFormat) as date
                    FROM transfers
                    WHERE blockTime > :startingTimeStamp
                    GROUP BY DATE_FORMAT(FROM_UNIXTIME(blockTime), :dateFormat)
                    ORDER BY blockTime DESC;
    `;

    const values = {
      dateFormat: dateGroupFormat,
      startingTimeStamp,
    };

    const blocksData = await this.mappedQuery<{ blockNumber: number, blockTime: number, readableDate: string, totalCirculation: number }>(query, row => {
      return {
        blockNumber: row.blockNumber,
        blockTime: row.blockTime,
        readableDate: row.date,
        totalCirculation: hardCodedOrbsInCirculation,
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

    connection.config.queryFormat = function(query, values) {
      if (!values) { return query; }

      return query.replace(/\:(\w+)/g, function(txt, key) {
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;
      }.bind(this));
    };

    this.dbConnection = connection;
  }

  private async query(queryStr: string, values?: any): Promise<any> {
    return new Promise(((resolve, reject) => {
      this.dbConnection.query(queryStr, values, (err, dbRows) => {
        if (err) {
          return reject(err);
        }

        return resolve(dbRows);
      });
    }));
  }

  private async mappedQuery<T>(queryStr: string, rowsMapper?: (row: any) => T,  values?: {} ): Promise<T[]> {
    const dbRes = await this.query(queryStr, values);

    const results = dbRes.map(row => rowsMapper(row));

    return results;
  }

}
