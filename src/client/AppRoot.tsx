/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, StylesProvider, ThemeProvider } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { Background } from './components/Background';
import { Header } from './components/Header';
import styled, { ThemeProvider as SCThemeProvider} from 'styled-components';

const appVersion = (window as any).appVersion;

const baseTheme = createMuiTheme({
    palette: {
        primary: {
            main: '#DAE2E6',
        } ,
    },
}); // override your theme here

const AppStyles = {
    colors: {
        darkText: '#67758D',
        lightText: '#8994A7',
    }
};

const themeAndStyle = {
    ...baseTheme,
    style: AppStyles,
};

/**
 * Ensures the container will take up more of the screen's width
 */
const StyledContainer = styled(Container)(() => ({
    maxWidth: '100%',
    width: '90%',
}));

export const AppRoot = () => (
  <BrowserRouter>
    <StylesProvider injectFirst>
        <ThemeProvider theme={baseTheme}>
            <SCThemeProvider theme={themeAndStyle}>
                <> {/* DEV_NOTE : O.L : Fragment is here to fix 'SCThemeProvider' children type warning*/}
                    <CssBaseline />
                    <Background appVersion={appVersion} />
                    <StyledContainer >
                        <Header />
                        <App />
                    </StyledContainer>
                </>
            </SCThemeProvider>
        </ThemeProvider>

    </StylesProvider>
  </BrowserRouter>
);
