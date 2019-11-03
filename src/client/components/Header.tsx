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
import {Avatar, Button, IconButton} from "@material-ui/core";

export class Header extends React.Component {
  public render() {
    return (
      <AppBar position='static' >
        <Toolbar>
            <Avatar src={"https://icodrops.com/wp-content/uploads/2018/01/Orbs-logo.jpg"}></Avatar>
          {/*<Typography variant='h5'>ORBS Token Explorer</Typography>*/}
            <Button> Overview </Button>
        </Toolbar>
      </AppBar>
    );
  }
}
