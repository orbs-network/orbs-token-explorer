/* tslint:disable:variable-name */
import React from 'react';

import {Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis} from 'recharts';
import {Container, Divider, Paper, Typography} from '@material-ui/core';
import styled from 'styled-components';
import {TopTokenHoldersSection} from "./topTokenHolders/TopTokenHoldersSection";

const PagePadder = styled('div')(({theme}) => ({
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

const PageContent = styled('div')(({theme}) => ({
    display: 'flex',
    justifyContent: 'center',

    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    // [theme.breakpoints.up('sm')]: {
    //     paddingLeft: theme.spacing(3),
    //     paddingRight: theme.spacing(3),
    // },
    // [theme.breakpoints.up('md')]: {
    //     paddingLeft: theme.spacing(4),
    //     paddingRight: theme.spacing(4),
    // },
}));

const PageHeader = styled(Typography)(({theme}) => ({
    color: theme.style.colors.darkText,
}));

const StyledDivider = styled(Divider)({
    marginTop: '1em',
    marginBottom: '1em',
});

export const TokenOverview = () => {
    return (
        <PagePadder>
            <PageHeader variant={'h5'}>Token Overview</PageHeader>
            <StyledDivider />
            <PageContent>
                <TopTokenHoldersSection/>
            </PageContent>
        </PagePadder>
    );
};
