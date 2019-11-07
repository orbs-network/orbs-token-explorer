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
import {IAPITopHoldersResponse, ITopHoldersAtTime} from '../../shared/serverResponses/bi/serverBiResponses';
import {getTopHolders} from './tokenDistributionHandler';

import { devRes } from '../db/topTokenHolders';

// let decCache: ITopHoldersAtTime[] = devRes;
let decCache: ITopHoldersAtTime[] = null;

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

  router.get<{name: string}>('/api/token-dist/top-holders', async (req, res) => {
    // const topHoldersAtTimePoints = await db.getTopTokenHolders();

    if (!decCache) {
      decCache = await db.getTopTokenHolders();
    }

    const topHoldersAtTimePoints = decCache;

    // const topHoldersAtTimePoints = decCache;

    const resObject: IAPITopHoldersResponse = {
      topHoldersAtTimePoints
    };

    res.send(resObject);
  });

  return router;
}
