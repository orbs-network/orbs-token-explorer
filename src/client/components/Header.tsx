/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import {RefObject} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import * as React from 'react';
import {Avatar, Button} from '@material-ui/core';
import {Link as RouterLink, LinkProps} from 'react-router-dom';
import styled from 'styled-components';

const Link1 = React.forwardRef((props: LinkProps, ref: RefObject<HTMLAnchorElement>) => <RouterLink innerRef={ref} {...props} />);

const StyledAppBar = styled(AppBar)({
    marginBottom: '2em'
});

export class Header extends React.Component {
  public render() {
    return (
      <StyledAppBar position='static' elevation={0}>
        <Toolbar>
            <Avatar src={'https://icodrops.com/wp-content/uploads/2018/01/Orbs-logo.jpg'}></Avatar>

            <Button component={Link1} to={'/token-dist'}>Overview</Button>
        </Toolbar>
      </StyledAppBar>
    );
  }
}
