/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import * as bodyParser from 'body-parser';
import { Router } from 'express';
import { IDB } from '../db/IDB';
import { ISomeData } from '../../shared/ISomeData';

export function apiRouter(db: IDB) {
  const router = Router();
  router.use(bodyParser.json());

  // EXAMPLE //
  router.get('/api/some-data/:name', async (req, res) => {
    const { name } = req.params;
    const someData: ISomeData = await db.getSomeData(name);
    res.json(someData);
  });

  // EXAMPLE //
  router.post('/api/some-data', async (req, res) => {
    const { someData } = req.body;
    await db.storeSomeData(someData);
    res.send('ok');
  });

  return router;
}
