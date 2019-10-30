/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { Typography } from '@material-ui/core';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
      position: `absolute`,
      overflow: 'hidden',
    },
    appVersion: {
      position: `fixed`,
      bottom: 4,
      left: 4,
    },
  });

interface IProps extends WithStyles<typeof styles> {
  appVersion: string;
}

export const Background = withStyles(styles)(
  class extends React.Component<IProps> {
    public render() {
      const { classes, appVersion } = this.props;
      return (
        <div className={classes.root}>
          <Typography className={classes.appVersion} variant='caption'>
            {appVersion}
          </Typography>
        </div>
      );
    }
  },
);
