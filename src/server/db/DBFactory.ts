/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { IDB } from './IDB';
import { InMemoryDB } from './InMemoryDB';
import { MySqlDB } from './MySqlDB';
import { POSTGRES_URI, DATABASE_TYPE } from '../config';
import * as winston from 'winston';

export function genDb(logger: winston.Logger): IDB {
  switch (DATABASE_TYPE) {
    case 'POSTGRES':
    case 'MYSQL':
      return new MySqlDB(logger, POSTGRES_URI);

    default:
      return new InMemoryDB();
  }
}
