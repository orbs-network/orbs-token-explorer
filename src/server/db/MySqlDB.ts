/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import Moment from 'moment';
import { Connection, createConnection } from 'mysql';
import * as winston from 'winston';
import { ITopHoldersAtTime } from '../../shared/serverResponses/bi/serverBiResponses';
import { IDB } from './IDB';

export class MySqlDB implements IDB {
  private dbConnection: Connection;

  constructor(
    private logger: winston.Logger,
    private host: string,
    private user: string,
    private password: string,
    private database: string,
  ) {
    // this.buildConnection(host, user, password);
  }

  // tslint:disable-next-line:no-empty
  public async rebuild(): Promise<void> {}

  public async init(): Promise<void> {
    return this.buildConnection(this.host, this.user, this.password, this.database);
  }

  public async destroy(): Promise<void> {
    await this.dbConnection.end();
  }

  public async getTopTokenHolders() {
    // Calculates the timestamp to start searching from
    const startTimeStamp = Moment.utc()
      .subtract(1, 'year')
      .startOf('month')
      .unix();

    // find all relevant blocks data
    const relevantBlockData = await this.fetchLatestBlocksDataFromTimestamp(startTimeStamp, '%m/%Y');

    const topHoldersByTimes: ITopHoldersAtTime[] = await Promise.all(
      relevantBlockData.map(async blockGist => {
        const topHoldersForBlock = await this.fetchTopHoldersByBlock(blockGist.blockNumber);

        const topHolderForTimeUnit: ITopHoldersAtTime = {
          totalTokens: blockGist.totalCirculation,
          topHolders: topHoldersForBlock.map(holderForBlock => ({
            tokens: holderForBlock.tokens,
            displayName: holderForBlock.name || holderForBlock.address,
            address: holderForBlock.address,
            isOrbsAddress: holderForBlock.type === 'OrbsLtd',
            isGuardian: holderForBlock.isGuardian,
            isExchange: holderForBlock.type === 'Exchange',
          })),
          timestamp: blockGist.blockTime,
        };

        return topHolderForTimeUnit;
      }),
    );

    // Sorts by time, ascending
    topHoldersByTimes.sort((a, b) => a.timestamp - b.timestamp);

    return topHoldersByTimes;
  }

  /**
   * Fetches data about the top holders (more than the minimum holding) for the given block.
   */
  private async fetchTopHoldersByBlock(blockNumber: number) {
    const MIN_HOLDING = 1_000_000; // Used for optimization
    const EXCHANGE = 'Exchange';

    const query = ` SELECT recipient,
                           in_orbs(get_stake_at_block(recipient, :blockNumber)) as tokens,
                           is_guardian_at_block(recipient,:blockNumber) as isGuardian,
                           knwn_adrs.name as name,
                           knwn_adrs.region as addressType
                    FROM (SELECT source as recipient
                          FROM transfers
                          UNION
                          SELECT recipient
                          FROM transfers) all_unique_addresses
                          LEFT JOIN known_addresses as knwn_adrs
                            ON knwn_adrs.address = all_unique_addresses.recipient
                            AND knwn_adrs.region in ('${EXCHANGE}')
                    WHERE in_orbs(get_stake_at_block(recipient, :blockNumber)) > :minHolding
                    ORDER BY get_stake_at_block(recipient, :blockNumber) desc`;

    const values = {
      blockNumber,
      minHolding: MIN_HOLDING,
    };

    // tslint:disable-next-line:interface-over-type-literal
    type TTopHolderGist = {
      address: string;
      name: string;
      type: 'OrbsLtd' | 'Exchange' | 'Unknown';
      tokens: number;
      isGuardian: boolean;
    };

    return this.mappedQuery<TTopHolderGist>(
      query,
      row => ({
        address: row.recipient,
        name: row.name,
        type: row.addressType ? (row.addressType === EXCHANGE ? 'Exchange' : 'Unknown') : 'Unknown',
        tokens: row.tokens,
        isGuardian: !!row.isGuardian,
      }),
      values,
    );
  }

  private async fetchLatestBlocksDataFromTimestamp(startingTimeStamp: number, dateGroupFormat: string) {
    // const hardCodedOrbsInCirculation = 2_000_000_000;
    const HARD_CODED_ORBS_IN_CIRCULATION = 1_890_000_000;

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

    // tslint:disable-next-line:interface-over-type-literal
    type TBlockGist = {
      blockNumber: number;
      blockTime: number;
      readableDate: string;
      totalCirculation: number;
    };

    const blocksData = await this.mappedQuery<TBlockGist>(
      query,
      row => {
        return {
          blockNumber: row.blockNumber,
          blockTime: row.blockTime,
          readableDate: row.date,
          totalCirculation: HARD_CODED_ORBS_IN_CIRCULATION,
        };
      },
      values,
    );

    return blocksData;
  }

  private buildConnection(host: string, user: string, password: string, database: string): Promise<any> {
    this.logger.info('Building MySQL connection');

    const connection = createConnection({
      host,
      user,
      password,
      database,
    });

    connection.on('error', async err => {
      this.logger.error(`db error ${err}`);

      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        try {
          this.logger.warn('MySql connection lost, will try to rebuild connection.');
          this.buildConnection(host, user, password, host);
        } catch (e) {
          this.logger.error(`Failed re-connect attempt ${e}`);
          throw e;
        }
      } else {
        // connection idle timeout (the wait_timeout
        this.logger.error(`error code : ${err.code}`);
        throw err; // server variable configures this)
      }
    });

    connection.config.queryFormat = function(query, values) {
      if (!values) {
        return query;
      }

      return query.replace(
        /\:(\w+)/g,
        function(txt, key) {
          if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
          }
          return txt;
        }.bind(this),
      );
    };

    return new Promise<any>((resolve, reject) => {
      connection.connect(err => {
        if (err) {
          this.logger.error(`Failed connecting to MySql server: ${err}`);
          throw reject(err);
        }

        this.dbConnection = connection;

        resolve();
      });
    });
  }

  private async query(queryStr: string, values?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dbConnection.query(queryStr, values, (err, dbRows) => {
        if (err) {
          return reject(err);
        }

        return resolve(dbRows);
      });
    });
  }

  /**
   * Allows us to map the db result to another form in a type-safe manner.
   */
  private async mappedQuery<T>(queryStr: string, rowsMapper?: (row: any) => T, values?: {}): Promise<T[]> {
    const dbRes = await this.query(queryStr, values);

    const results = dbRes.map(row => rowsMapper(row));

    return results;
  }
}
