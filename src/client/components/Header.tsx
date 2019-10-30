/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';

export class Header extends React.Component {
  public render() {
    return (
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h5'>ORBS Token Explorer</Typography>
        </Toolbar>
      </AppBar>
    );
  }
}
