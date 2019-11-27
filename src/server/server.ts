/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import express from 'express';
import path from 'path';

import config from './config';
import { forceHttps } from './middlewares/ForceHttps';
import { apiRouter } from './routes/api-router';
import { pagesRouter } from './routes/pages-router';
import { staticsRouter } from './routes/statics-router';
import { IDB } from './db/IDB';

import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import passportLocal from 'passport-local';

function configurePassport() {
  const envUserName = process.env.AUTH_USERNAME;
  const envPassword = process.env.AUTH_PASSWORD;

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(
    new passportLocal.Strategy({ passReqToCallback: true }, (req, username, password, done) => {
      if (envUserName === username && envPassword === password) {
        const approvedUser = {
          isOk: true,
          blip: 'blop',
        };

        return done(null, approvedUser);
      } else {
        return done(null, false);
      }
    }),
  );
}

export function initServer(db: IDB) {
  const app = express();

  configurePassport();

  if (config.FORCE_HTTPS) {
    app.use(forceHttps);
  }

  app.set('view engine', 'ejs');

  // Security & Auth
  app.use(helmet());
  app.use(
    session({
      cookie: {
        secure: true,
        sameSite: true,
      },
      secret: 'dev_secret', // TOOD : ORL : Add a better secret
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
  app.use(staticsRouter());
  app.use(apiRouter(db));
  app.use(pagesRouter());

  const server = app.listen(config.SERVER_PORT, () => {
    console.log(`App listening on port ${config.SERVER_PORT}!`);
  });
  return server;
}
