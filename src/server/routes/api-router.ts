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
import passport from 'passport';

const apiCache = new NodeCache();
const TOP_HOLDERS_CACHE_KEY = 'topHolders';

export function apiRouter(db: IDB) {
  const router = Router();
  router.use(bodyParser.json());

  router.post(
    '/api/auth/login',
    (req, res, next) => {
      req.params.password = req.body.password;
      req.params.username = req.body.username;
      next();
    },
    passport.authenticate('local', {
      successReturnToOrRedirect: '/login',
    }),
  );

  router.get(
    '/api/token-dist/top-holders',
    // Basic auth filtering
    (req, res, next) => {
      if (req.user) {
        next();
      } else {
        res.status(400).send();
      }
    },
    async (req, res) => {
      let topHoldersAtTimePoints: ITopHoldersAtTime[];

      if (!apiCache.has(TOP_HOLDERS_CACHE_KEY)) {
        console.log('No cache, getting Top Token Holders');
        topHoldersAtTimePoints = await db.getTopTokenHolders();
        apiCache.set(TOP_HOLDERS_CACHE_KEY, topHoldersAtTimePoints, 60 * 60 * 24);
      } else {
        topHoldersAtTimePoints = apiCache.get(TOP_HOLDERS_CACHE_KEY);
        console.log('Cache found for topHolders');
      }
      console.log(`topHoldersAtTimePoints: ${topHoldersAtTimePoints.length}`);

      const resObject: IAPITopHoldersResponse = {
        topHoldersAtTimePoints,
      };

      res.send(resObject);
    },
  );

  return router;
}
