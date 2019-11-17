import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Divider, FormControlLabel, FormGroup, Typography, Switch, Slider } from '@material-ui/core';
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

export const TokenOverview = () => {
  const isLoadingGraphData = useBoolean(true);
  const showOrbsLtd = useBoolean(false);
  const showGuardians = useBoolean(true);
  const showExchanges = useBoolean(true);
  const showUnknowns = useBoolean(true);
  const maximumTokens = useNumber(1_000_000_000);
  const minPercentage = useNumber(1);
  const [topHoldersByTimesFromServer, setTopHoldersByTimesFromServer] = useState<ITopHoldersAtTime[]>(null);

  // Reacts to the percentage slider change
  const onSliderChange = useCallback(
    (_, newValue: number) => {
      minPercentage.setValue(newValue);
    },
    [minPercentage],
  );

  // Builds the filtering function
  const holderFiltering = useCallback(
    (holder: IHolderStakeSnapshot, totalOrbsInCirculation: number) => {
      const minTokens = minPercentage.value > 0 ? (totalOrbsInCirculation / 100) * minPercentage.value : 0;

      return (
        holder.tokens < maximumTokens.value && // Less than maximum value
        holder.tokens > minTokens && // More than the minimum tokens
        (showOrbsLtd.value ? true : !holder.isOrbsAddress) && // Filters orbs addresses
        (showGuardians.value ? true : !holder.isGuardian) && // Filters orbs addresses
        (showGuardians.value ? true : !holder.isGuardian) && // Filters guardians
        (showExchanges.value ? true : !holder.isExchange) && // Filters exchanges
        (showUnknowns.value ? true : holder.isGuardian || holder.isExchange || holder.isOrbsAddress) // Show unknowns
      );
    },
    [
      showOrbsLtd.value,
      minPercentage.value,
      maximumTokens.value,
      showGuardians.value,
      showUnknowns.value,
      showExchanges.value,
    ],
  );

  // Extracts only the values that should be displayed
  const topHoldersByTimesForDisplay: ITopHoldersAtTime[] = useMemo(() => {
    if (!topHoldersByTimesFromServer) {
      return [];
    }

    return topHoldersByTimesFromServer.map(topHoldersAtTIme => {
      // Clone & Filter all holders based on conditions
      const topHoldersAtTImeClone = { ...topHoldersAtTIme };
      topHoldersAtTImeClone.topHolders = topHoldersAtTIme.topHolders.filter(topHolder =>
        holderFiltering(topHolder, topHoldersAtTIme.totalTokens),
      );

      return topHoldersAtTImeClone;
    });
  }, [topHoldersByTimesFromServer, holderFiltering]);

  // Barbaric server fetch
  useEffect(() => {
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
    <PagePadder>
      <PageHeader variant={'h5'}>Token Explorer</PageHeader>
      <StyledDivider />
      <PageContent>
        <FormGroup row>
          {/* Show Orbs LTD */}
          {/*<FormControlLabel control={<Switch*/}
          {/*    checked={showOrbsLtd.value}*/}
          {/*    onChange={showOrbsLtd.toggle}*/}
          {/*    color='secondary'*/}
          {/*/>} label={'Orbs LTD'}/>*/}

          {/* Show Guardians */}
          <FormControlLabel
            control={<Switch checked={showGuardians.value} onChange={showGuardians.toggle} color='secondary' />}
            label={'Guardians'}
          />

          {/* Show Exchanges */}
          <FormControlLabel
            control={<Switch checked={showExchanges.value} onChange={showExchanges.toggle} color='secondary' />}
            label={'Exchanges'}
          />

          {/* Unknowns */}
          <FormControlLabel
            control={<Switch checked={showUnknowns.value} onChange={showUnknowns.toggle} color='secondary' />}
            label={'Unknowns'}
          />

          {/* Min percentage from stake */}
          <FormControlLabel
            control={
              <Slider
                defaultValue={minPercentage.value}
                value={minPercentage.value}
                onChange={onSliderChange}
                valueLabelDisplay={'auto'}
                color='secondary'
                min={0.5}
                max={5}
                step={0.1}
                marks={labelsForSlider}
              />
            }
            label={'Min % of circulation'}
            labelPlacement={'top'}
            style={{ width: '30em' }}
          />
        </FormGroup>
        <TopTokenHoldersSection
          isLoading={isLoadingGraphData.value}
          topHoldersByTimeList={topHoldersByTimesForDisplay}
        />
      </PageContent>
    </PagePadder>
  );
};

const labelsForSlider: Array<{ label: string; value: number }> = [
  { label: `${0.5}%`, value: 0.5 },
  { label: `${2.5}%`, value: 2.5 },
  { label: '5%', value: 5 },
];
