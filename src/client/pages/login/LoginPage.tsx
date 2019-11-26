import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {
  Button,
  Divider,
  FormControlLabel,
  FormGroup,
  Typography,
  Switch,
  Slider,
  FormControl,
  InputLabel, Input, FormHelperText
} from '@material-ui/core';
import styled from 'styled-components';
import { TopTokenHoldersSection } from './topTokenHolders/TopTokenHoldersSection';
import { useBoolean, useNumber } from 'react-hanger';
import { OrbsBiService } from '../../services/OrbsBiService';
import { IHolderStakeSnapshot, ITopHoldersAtTime } from '../../../shared/serverResponses/bi/serverBiResponses';

const PagePadder = styled('div')(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

const PageContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',

  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

const PageHeader = styled(Typography)(({ theme }) => ({
  color: theme.style.colors.darkText,
}));

const StyledDivider = styled(Divider)({
  marginTop: '1em',
  marginBottom: '1em',
});

const orbsBiService = new OrbsBiService();

export const LoginPage = () => {
  const userRef = useRef();
  const passwordRef = useRef();

  return (
    <>
    <FormControl>
      <InputLabel htmlFor="input-username">Email address</InputLabel>
      <Input id="input-username" ref={userRef}/>
    </FormControl>
      <br/>
      <FormControl>
        <InputLabel htmlFor="input-password">Password</InputLabel>
        <Input id="input-password" type={'password'} ref={passwordRef}/>
      </FormControl>

      <br/>
      <Button>Log In</Button>
    </>
  )
  // {/*<PagePadder>*/}
  //   {/*  <PageHeader variant={'h5'}>Login</PageHeader>*/}
  //   {/*  <StyledDivider />*/}
  //   {/*  /!*<PageContent>*!/*/}
  //   {/*  <form onSubmit={() => console.log('submit')}>*/}
  //   {/*    <label>*/}
  //   {/*      Name:*/}
  //   {/*      <input type="text" />*/}
  //   {/*    </label>*/}
  //
  //   {/*    <input type="submit"  />*/}
  //   {/*  </form>*/}
  //   {/*  /!*</PageContent>*!/*/}
  //   {/*</PagePadder>*/}
  // );
};
