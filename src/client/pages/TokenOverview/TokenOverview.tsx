import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Button, Divider, Typography} from '@material-ui/core';
import styled from 'styled-components';
import {TopTokenHoldersSection} from './topTokenHolders/TopTokenHoldersSection';
import {useBoolean, useNumber} from 'react-hanger';
import {OrbsBiService} from '../../services/OrbsBiService';
import {IHolderStake, ITopHoldersAtTime} from '../../../shared/serverResponses/bi/serverBiResponses';

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
    const maximumTokens = useNumber(1_000_000_000);
    const minPercentage = useNumber(0.5);
    const [topHoldersByTimesFromServer, setTopHoldersByTimesFromServer] = useState<ITopHoldersAtTime[]>(null);

    const holderFiltering = useCallback((holder: IHolderStake, totalOrbsInCirculation: number) => {
        const minTokens = (totalOrbsInCirculation / 100) * minPercentage.value;

        return (holder.tokens < maximumTokens.value) && (holder.tokens > minTokens);
    }, [minPercentage.value, maximumTokens.value]);

    const topHoldersByTimesForDisplay: ITopHoldersAtTime[] = useMemo(() => {
        if (!topHoldersByTimesFromServer) {
            return [];
        }

        return topHoldersByTimesFromServer.map(topHoldersAtTIme => {
            // Filter all holders based on conditions
            const filteredHolders = topHoldersAtTIme.topHolders.filter(topHolder => holderFiltering(topHolder, topHoldersAtTIme.totalTokens));
            const topHoldersAtTImeClone = {...topHoldersAtTIme};
            topHoldersAtTImeClone.topHolders = filteredHolders;

            return topHoldersAtTImeClone;
        });
    }, [topHoldersByTimesFromServer]);

    // Barbaric server fetch
    useEffect( () => {
        async function fetchData() {
            const res = await orbsBiService.getTopHoldersForPastYear(20);

            const { topHoldersAtTimePoints } = res;

            topHoldersAtTimePoints.sort((a, b) => a.timestamp - b.timestamp);

            setTopHoldersByTimesFromServer(topHoldersAtTimePoints);

            isLoadingGraphData.setFalse();
        }

        fetchData().catch(e => alert(e));
    }, [isLoadingGraphData, orbsBiService, setTopHoldersByTimesFromServer]);

    return (
        <PagePadder >
            <PageHeader variant={'h5'} >Token Overview</PageHeader>
            <StyledDivider />
            <PageContent>
                <TopTokenHoldersSection isLoading={isLoadingGraphData.value} topHoldersByTimeList={topHoldersByTimesForDisplay}/>
            </PageContent>
        </PagePadder>
    );
};
