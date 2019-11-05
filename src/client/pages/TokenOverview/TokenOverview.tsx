import React, {useEffect, useState} from 'react';

import {Button, Divider, Typography} from '@material-ui/core';
import styled from 'styled-components';
import {TopTokenHoldersSection} from './topTokenHolders/TopTokenHoldersSection';
import {useBoolean, useNumber} from 'react-hanger';
import {OrbsBiService} from '../../services/OrbsBiService';
import {ITopHoldersAtTime} from '../../../shared/serverResponses/bi/serverBiResponses';

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
}));

const PageHeader = styled(Typography)(({theme}) => ({
    color: theme.style.colors.darkText,
}));

const StyledDivider = styled(Divider)({
    marginTop: '1em',
    marginBottom: '1em',
});

const orbsBiService = new OrbsBiService();

export const TokenOverview = () => {
    const isLoadingGraphData = useBoolean(true);
    const [topHoldersByTimes, setTopHoldersByTimes] = useState<ITopHoldersAtTime[]>(null);

    // Barbaric server fetch
    useEffect( () => {
        async function fetchData() {
            const res = await orbsBiService.getTopHoldersForPastYear(20);

            setTopHoldersByTimes(res.topHoldersAtTimePoints);
            isLoadingGraphData.setFalse();
        }

        fetchData().catch(e => alert(e));
    }, [isLoadingGraphData, orbsBiService, setTopHoldersByTimes]);

    return (
        <PagePadder >
            <PageHeader variant={'h5'} >Token Overview</PageHeader>
            <StyledDivider />
            <PageContent>
                <TopTokenHoldersSection isLoading={isLoadingGraphData.value} topHoldersByTimeList={topHoldersByTimes}/>
            </PageContent>
        </PagePadder>
    );
};
