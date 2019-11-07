import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Button, Divider, FormControlLabel, FormGroup, Typography, Switch, Slider} from '@material-ui/core';
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
    flexDirection: 'column',
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
    const filterOrbsLtd = useBoolean(true);
    const showOnlyGuardians = useBoolean(false);
    const maximumTokens = useNumber(1_000_000_000);
    const minPercentage = useNumber(1);
    const [topHoldersByTimesFromServer, setTopHoldersByTimesFromServer] = useState<ITopHoldersAtTime[]>(null);

    const holderFiltering = useCallback((holder: IHolderStake, totalOrbsInCirculation: number) => {
        const minTokens = (minPercentage.value > 0) ? (totalOrbsInCirculation / 100) * minPercentage.value : 0;

        return (
            (holder.tokens < maximumTokens.value) && // Less than maximum value
            (holder.tokens > minTokens) && // More than the minimum tokens
            !(filterOrbsLtd.value && holder.isOrbsAddress) // Filters orbs addresses
        );
    }, [filterOrbsLtd.value, minPercentage.value, maximumTokens.value, showOnlyGuardians.value]);

    const topHoldersByTimesForDisplay: ITopHoldersAtTime[] = useMemo(() => {
        if (!topHoldersByTimesFromServer) {
            return [];
        }

        return topHoldersByTimesFromServer.map(topHoldersAtTIme => {
            // Clone & Filter all holders based on conditions
            const topHoldersAtTImeClone = {...topHoldersAtTIme};
            topHoldersAtTImeClone.topHolders = topHoldersAtTIme.topHolders.filter(topHolder => holderFiltering(topHolder, topHoldersAtTIme.totalTokens));

            return topHoldersAtTImeClone;
        });
    }, [topHoldersByTimesFromServer, holderFiltering]);

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
                <FormGroup row>
                    <FormControlLabel control={<Switch
                        checked={filterOrbsLtd.value}
                        onChange={filterOrbsLtd.toggle}
                        color='secondary'
                    />} label={'Filter Orbs LTD'}/>

                    <FormControlLabel control={
                        <Slider
                        defaultValue={minPercentage.value}
                        value={minPercentage.value}

                        // onChangeCommitted={(e, value) => minPercentage.setValue(value)}
                        onChange={(e, value) => minPercentage.setValue(value)}

                        valueLabelDisplay={'auto'}

                        color='secondary'
                        min={0.5}
                        max={5}
                        step={0.1}
                    />}
                                      label={'Min stake %'}
                                      style={{width: '30em'}}
                    />
                </FormGroup>
                <TopTokenHoldersSection isLoading={isLoadingGraphData.value} topHoldersByTimeList={topHoldersByTimesForDisplay}/>
            </PageContent>
        </PagePadder>
    );
};
