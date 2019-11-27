/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import * as React from 'react';
import { Redirect, withRouter } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import { Home } from './components/Home';
import { TokenOverview } from './pages/TokenOverview/TokenOverview';
import { LoginPage } from './pages/login/LoginPage';

interface IProps {
  location?: any;
}

const AppImpl = ({ location }: IProps) => {
  console.log('location', location);
  return (
    <Switch location={location}>
      {/*<Route*/}
      {/*  exact*/}
      {/*  path='/'*/}
      {/*  component={Home}*/}
      {/*/>*/}
      <Redirect exact from='/' to='/login' />
      <Route exact path='/tokenOverview' component={TokenOverview} />
      <Route exact path='/login' component={LoginPage} />
    </Switch>
  );
};

export const App: any = withRouter(AppImpl);
