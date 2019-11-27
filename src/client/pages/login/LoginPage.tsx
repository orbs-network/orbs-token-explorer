import React, { useCallback, useRef } from 'react';
import axios from 'axios';
import { Button, Divider, Typography, FormControl, InputLabel, Input } from '@material-ui/core';
import styled from 'styled-components';
import { OrbsBiService } from '../../services/OrbsBiService';
import { useHistory } from 'react-router';

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
  const userRef = useRef<HTMLInputElement>();
  const passwordRef = useRef<HTMLInputElement>();
  const history = useHistory();

  const onSubmit = useCallback(async () => {
    const userName = userRef.current.value;
    const password = passwordRef.current.value;

    // Clear for security
    userRef.current.value = '';
    passwordRef.current.value = '';

    try {
      const response = await axios.post('/api/auth/login', {
        username: userName,
        password,
      });

      if (response.status === 200) {
        history.push('/tokenOverview');
      }

      console.log(response);
    } catch (e) {
      if (e.response.status === 400 || e.response.status === 401) {
        alert('Wrong credentials');
      } else {
        alert(e);
      }
    }
  }, [history]);

  return (
    <PagePadder>
      <PageHeader variant={'h5'}>Login</PageHeader>
      <StyledDivider />
      <PageContent>
        <div style={{ width: '20em' }}>
          <FormControl>
            <InputLabel htmlFor='input-username'>Username</InputLabel>
            <Input id='input-username' inputRef={userRef} />
          </FormControl>
          <br />
          <FormControl>
            <InputLabel htmlFor='input-password'>Password</InputLabel>
            <Input id='input-password' type={'password'} inputRef={passwordRef} />
          </FormControl>

          <br />
          <br />
          <Button onClick={onSubmit} type={'submit'}>
            Log In
          </Button>
        </div>
      </PageContent>
    </PagePadder>
  );
};
