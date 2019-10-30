/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { genDb } from './db/DBFactory';
import { initServer } from './server';
import * as config from './config';
import * as winston from 'winston';
import { genLogger } from './logger/LoggerFactory';

async function main() {
  console.log(`*******************************************`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`config: ${JSON.stringify(config, null, 2)}`);
  console.log(`*******************************************`);

  const {
    LOG_TO_CONSOLE,
    LOG_TO_FILE,
    LOG_TO_ROLLBAR,
  } = config;
  const logger: winston.Logger = genLogger(LOG_TO_CONSOLE, LOG_TO_FILE, LOG_TO_ROLLBAR);

  // externals
  const db = genDb(logger);
  try {
    await db.init();
    logger.info(`Database connected and initialized.`);
  } catch (error) {
    logger.error(`Unable to connect db`, { error });
    process.exit(1);
  }

  // internals
  const server = initServer(db);
}

main();
