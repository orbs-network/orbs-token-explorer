/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { Background } from './components/Background';
import { Header } from './components/Header';

const appVersion = (window as any).appVersion;

const baseTheme = createMuiTheme({}); // override your theme here

export const AppRoot = () => (
  <BrowserRouter>
    <MuiThemeProvider theme={baseTheme}>
      <CssBaseline />
      <Background appVersion={appVersion} />
      <Container>
          <Header />
          <App />
      </Container>
    </MuiThemeProvider>
  </BrowserRouter>
);
