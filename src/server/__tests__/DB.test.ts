/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import * as winston from 'winston';
import { POSTGRES_URI } from '../config';
import { IDB } from '../db/IDB';
import { InMemoryDB } from '../db/InMemoryDB';
import { PostgresDB } from '../db/PostgresDB';
import { genLogger } from '../logger/LoggerFactory';

const logger: winston.Logger = genLogger(false, false, false);

testDb(new InMemoryDB(), 'InMemoryDB');
testDb(
  new PostgresDB(logger, 'postgres://token-explorer:token-explorer@localhost:5432/token-explorer-for-tests'),
  'PostgresDB',
);

function testDb(db: IDB, dbName: string) {
  describe(dbName, async () => {
    beforeEach(async () => {
      await db.init();
      await db.rebuild();
    });

    afterEach(async () => {
      await db.destroy();
    });

    it('should set and get some data', async () => {
      db.storeSomeData({ name: 'Test', age: 55 });
      const actual = await db.getSomeData('Test');
      expect(actual.age).toEqual(55);
      expect(actual.name).toEqual('Test');
    });
  });
}
