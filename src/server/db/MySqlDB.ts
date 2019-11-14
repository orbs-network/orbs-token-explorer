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

  constructor(private logger: winston.Logger, private host: string, private user: string, private password: string, private database: string) {
    // this.buildConnection(host, user, password);
  }

  public async rebuild(): Promise<void> {
  }

  public async init(): Promise<void> {
    return  this.buildConnection(this.host, this.user, this.password, this.database);
  }

  public async destroy(): Promise<void> {
    await this.dbConnection.end();
  }
  public async getTopTokenHolders() {
    // Used for optimization
    const minHolding = 1_000_000;

    // Used to determine the time range and units returned by the query.
    const timeUnitFormat = '%m/%Y';
    const timeUnitName = 'month';

    // Calculates the timestamp to start searching from
    const startTimeStamp = Moment.utc().subtract(1, 'year').startOf(timeUnitName).unix();

    // find all relevant blocks data
    const relevantBlockData = await this.fetchLatestBlocksDataForRange(startTimeStamp, timeUnitFormat);

    const topHoldersByTimes: ITopHoldersAtTime[] = await Promise.all(relevantBlockData.map(async blockData => {
      // Fetches all of the top holders for the given block
      const topHoldersForBlock =  await this.fetchTopHoldersByBlock(blockData.blockNumber, minHolding);

      const topHOlderForTimeUnit: ITopHoldersAtTime = {
        totalTokens: blockData.totalCirculation,
        topHolders: topHoldersForBlock.map(holderForBlock => ({
          tokens: holderForBlock.tokens,
          displayName: holderForBlock.name || holderForBlock.address,
          address: holderForBlock.address,
          isOrbsAddress: holderForBlock.type === 'OrbsLtd',
          isGuardian: holderForBlock.isGuardian,
          isExchange: holderForBlock.type === 'Exchange',
        })),
        timestamp: blockData.blockTime,
      };

      return topHOlderForTimeUnit;
    }));

    // Sorts by time, ascending
    topHoldersByTimes.sort((a, b) => a.timestamp - b.timestamp);

    return topHoldersByTimes;
  }


  /**
   * Fetches data about the top holders (more than the minimum holding) for the given block.
   */
  private async fetchTopHoldersByBlock(blockNumber: number, minHolding: number) {
    const ORBS_HQ = 'Orbs HQ';
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
                            AND knwn_adrs.region in ('${ORBS_HQ}', '${EXCHANGE}')
                    WHERE in_orbs(get_stake_at_block(recipient, :blockNumber)) > :minHolding
                    ORDER BY get_stake_at_block(recipient, :blockNumber) desc`;

    const values = {
      blockNumber,
      minHolding,
    };

    return this.mappedQuery<{ address: string, name: string, type: 'OrbsLtd' | 'Exchange' | 'Unknown', tokens: number, isGuardian: boolean}>(query, row => ({
      address: row.recipient,
      name: row.name,
      type: row.addressType ? (row.addressType === ORBS_HQ ? 'OrbsLtd' : 'Exchange' ) : 'Unknown',
      tokens: row.tokens,
      isGuardian: !!row.isGuardian,
    }), values);
  }

  /**
   * returns data about the latest block for each given time unit since the given start timestamp.
   */
  private async fetchLatestBlocksDataForRange(startingTimeStamp: number, dateGroupFormat: string) {
    // const hardCodedOrbsInCirculation = 2_000_000_000;
    const hardCodedOrbsInCirculation = 1_890_000_000;

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

  /**
   * Allows us to map the db result to another form in a type-safe manner.
   */
  private async mappedQuery<T>(queryStr: string, rowsMapper?: (row: any) => T,  values?: {} ): Promise<T[]> {
    const dbRes = await this.query(queryStr, values);

    const results = dbRes.map(row => rowsMapper(row));

    return results;
  }

}
