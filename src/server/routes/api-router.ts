/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import * as bodyParser from 'body-parser';
import { Router } from 'express';
import NodeCache from 'node-cache';
import { IAPITopHoldersResponse, ITopHoldersAtTime } from '../../shared/serverResponses/bi/serverBiResponses';
import { IDB } from '../db/IDB';

const apiCache = new NodeCache();

export function apiRouter(db: IDB) {
  const router = Router();
  router.use(bodyParser.json());

  router.get<{name: string}>('/api/token-dist/top-holders', async (req, res) => {
    const topHoldersCacheKey = 'topHolders';

    if (!apiCache.has(topHoldersCacheKey)) {
      const topHolders = await db.getTopTokenHolders();

      apiCache.set(topHoldersCacheKey, topHolders, 60 * 60 * 24);
    }

    const topHoldersAtTimePoints: ITopHoldersAtTime[] = apiCache.get(topHoldersCacheKey);

    // const topHoldersAtTimePoints = decCache;

    const resObject: IAPITopHoldersResponse = {
      topHoldersAtTimePoints
    };

    res.send(resObject);
  });

  return router;
}
