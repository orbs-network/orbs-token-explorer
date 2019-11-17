import React, { useCallback, useMemo } from 'react';
import {
  Bar,
  BarChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  TooltipPayload,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import styled from 'styled-components';
import Green from '@material-ui/core/colors/green';
import { Button, Snackbar, SnackbarContent, Typography } from '@material-ui/core';
import { ClipLoader } from 'react-spinners';
import moment from 'moment';
import toMaterialStyle from 'material-color-hash';
import genRandom from 'random-seed';
import { useStateful, useBoolean } from 'react-hanger';
import copyTextToClipboard from 'copy-text-to-clipboard';
import { IHolderStakeSnapshot, ITopHoldersAtTime } from '../../../../shared/serverResponses/bi/serverBiResponses';

interface IProps {
  isLoading: boolean;
  topHoldersByTimeList: ITopHoldersAtTime[];
}

const Section = styled('div')({
  width: '100%',
  border: '1px solid black',
});

const SectionHeader = styled('div')(({ theme }) => ({
  color: theme.style.colors.lightText,
  flexDirection: 'row',
  display: 'flex',
  flex: 1,
  justifyContent: 'space-between',
}));

const SectionHeaderTitle = styled(Typography)(({ theme }) => ({}));

const SectionHeaderActionButton = styled(Button)(({ theme }) => ({
  color: 'inherit',
}));

const SuccessSnackbarContent = styled(SnackbarContent)(({ theme }) => ({
  backgroundColor: Green[600],
}));

const TINE_UNIT_NAME_KEY = 'timeUnitName';

interface IHolderSummaryForGraph {
  address: string;
  displayName: string;
  percentageOfStake: number;
  tokens: number;
  roleDescription: string;
}

interface ISingleTimeUnitGraphData {
  timeUnitName: string;

  addressesToPercentage: { [address: string]: number };

  addressesToDisplayName: { [address: string]: string };

  holdersSummaries: IHolderSummaryForGraph[];
}

const useBarCharts = (
  graphsData: ISingleTimeUnitGraphData[],
  uniqueAddresses: string[],
  barClickHandler: (selectedXAxisValue: { [TINE_UNIT_NAME_KEY]: string }) => void,
) => {
  const barsForeachName = useMemo(() => {
    return uniqueAddresses.map((address, index) => {
      return (
        <Bar
          key={address}
          onClick={barClickHandler}
          dataKey={`addressesToPercentage.${address}`}
          stackId='a'
          fill={constantColorFromString(address)}
          unit={'%'}
          name={address}
          isAnimationActive={false}
        />
      );
    });
  }, [uniqueAddresses]);

  const DisplayAsBarChart = useMemo(() => {
    return (
      <BarChart
        data={graphsData}
        margin={{
          top: 20,
          right: 30,
          left: 50,
          bottom: 50,
        }}
      >
        <XAxis dataKey={TINE_UNIT_NAME_KEY} />
        <YAxis domain={[0, 100]} />
        <Tooltip formatter={toolTipFormatterForBars} />

        {barsForeachName}
      </BarChart>
    );
  }, [graphsData, barsForeachName]);

  return DisplayAsBarChart;
};

const usePieChart = (holdersSummaries: IHolderSummaryForGraph[], copyToClipboard: (text: string) => void) => {
  const onCellClickBuilder = useCallback(address => {
    return () => {
      copyToClipboard(address);
    };
  }, []);

  // Convert the 'data' to 'name'-'value' objects to fit the pie chart APi.
  const nameValuePairs = useMemo(() => {
    if (!holdersSummaries.length) {
      return [];
    }

    return holdersSummaries.map(holderSummary => ({
      name: holderSummary.address,
      value: parseFloat(holderSummary.percentageOfStake.toFixed(3)),
    }));
  }, [holdersSummaries]);

  // Build the custom cell
  const pieCells = useMemo(() => {
    // @ts-ignore (we add 'extra data')
    return holdersSummaries.map(holderSummary => (
      <Cell
        extraData={{ displayName: holderSummary.displayName, roleDescription: holderSummary.roleDescription }}
        key={`cell-${holderSummary.address}`}
        fill={constantColorFromString(holderSummary.address)}
        stroke={'black'}
        onClick={onCellClickBuilder(holderSummary.address)}
      />
    ));
  }, [holdersSummaries]);

  const endAngel = useMemo(() => {
    const totalPercentage = holdersSummaries.reduce(
      (total, holderSummary) => total + holderSummary.percentageOfStake,
      0,
    );
    const percentageInDegrees = (totalPercentage / 100) * 360;

    return percentageInDegrees;
  }, [holdersSummaries]);

  if (!holdersSummaries.length) {
    return <div> No holders </div>;
  }

  return (
    <PieChart>
      <Pie
        startAngle={0}
        endAngle={endAngel}
        animationBegin={0}
        animationDuration={1000}
        data={nameValuePairs}
        dataKey='value'
        nameKey='name'
        outerRadius={'40em'}
        fill='#8884d8'
        label
        labelLine={false}
      >
        {pieCells}
      </Pie>
      <Tooltip formatter={toolTipFormatterForPie} />
    </PieChart>
  );
};

export const TopTokenHoldersSection: React.FC<IProps> = (props: IProps) => {
  const { isLoading, topHoldersByTimeList } = props;

  const showSnackbar = useBoolean(false);
  const selectedTimeUnitFocus = useStateful(null);

  const { graphsData, uniqueAddresses } = useMemo<ReturnType<typeof toGraphsData>>(() => {
    if (!topHoldersByTimeList) {
      return {
        graphsData: [],
        uniqueAddresses: [],
      };
    }

    return toGraphsData(topHoldersByTimeList);
  }, [topHoldersByTimeList]);

  const dataObjectForFocus = useMemo<ISingleTimeUnitGraphData>(() => {
    if (!selectedTimeUnitFocus.value) {
      return null;
    }

    return graphsData.filter(dataObject => dataObject[TINE_UNIT_NAME_KEY] === selectedTimeUnitFocus.value)[0];
  }, [graphsData, selectedTimeUnitFocus.value]);

  const barClickHandler = useCallback(
    (xAxisGroup: { [TINE_UNIT_NAME_KEY]: string }) => {
      const dateName = xAxisGroup[TINE_UNIT_NAME_KEY];

      selectedTimeUnitFocus.setValue(dateName);
    },
    [selectedTimeUnitFocus],
  );

  const copyToClipboardAndNotify = useCallback(
    address => {
      copyTextToClipboard(address);
      showSnackbar.setTrue();
    },
    [showSnackbar],
  );

  const DisplayAsBarChart = useBarCharts(graphsData, uniqueAddresses, barClickHandler);

  const DisplayAsPieChart = usePieChart(
    dataObjectForFocus ? dataObjectForFocus.holdersSummaries : [],
    copyToClipboardAndNotify,
  );

  const displaysPieChart = !!selectedTimeUnitFocus.value;

  return (
    <Section style={{ height: '50em' }}>
      {/* Header */}
      <SectionHeader>
        <SectionHeaderTitle variant={'h6'}>Top token holders as percentage of circulation</SectionHeaderTitle>
        {displaysPieChart && (
          <SectionHeaderActionButton onClick={() => selectedTimeUnitFocus.setValue(null)}>
            {' '}
            Back to graph{' '}
          </SectionHeaderActionButton>
        )}
      </SectionHeader>

      {/* For loading */}
      <ClipLoader loading={isLoading} />

      {!isLoading && (
        <>
          <ResponsiveContainer>{displaysPieChart ? DisplayAsPieChart : DisplayAsBarChart}</ResponsiveContainer>
        </>
      )}

      {/* The snackbar for alerts */}
      <Snackbar open={showSnackbar.value} autoHideDuration={1000} onClose={showSnackbar.setFalse}>
        <SuccessSnackbarContent message={`Copied address to clipboard !`} />
      </Snackbar>
    </Section>
  );
};

/**
 * Formates the tooltip for the bar chart.
 */
function toolTipFormatterForBars(value: number, name: string, entry: TooltipPayload, index: number) {
  return [`${value.toFixed(3)} `, entry.payload.addressesToDisplayName[name]];
}

/**
 * Formates the tooltip for the pie chart.
 */
function toolTipFormatterForPie(value: number, name: string, entry: TooltipPayload, index: number) {
  const { displayName, roleDescription } = entry.payload.extraData;
  return [value.toFixed(3), `${displayName} (${roleDescription})`];
}

/**
 * Returns a hex color string generated from the give string.
 * Will always return the same color for the same string.
 */
function constantColorFromString(name: string): string {
  const rand = genRandom.create(name);
  // DEV_NOTE : starting from 500 to prevent very light (unreadable) colors
  // @ts-ignore
  const shade: 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 = (rand(4) + 5) * 100;
  const color = toMaterialStyle(name, shade).backgroundColor;

  return color;
}

/**
 * Converts the data from its server form to a format more useful for our graphs.
 */
function toGraphsData(
  topHoldersByTimes: ITopHoldersAtTime[],
): { graphsData: ISingleTimeUnitGraphData[]; uniqueAddresses: string[] } {
  const graphsData: ISingleTimeUnitGraphData[] = topHoldersByTimes.map(topHoldersByTime => {
    const totalTokensPerTimeFrame = topHoldersByTime.totalTokens;

    const timeUnitName = moment.utc(topHoldersByTime.timestamp * 1000).format('MMM/YY');

    const dataForGraphs = {
      // This is the value that will be display as the 'X' axis value
      timeUnitName,

      // here we will put all of the bars data for
      addressesToPercentage: {},

      //
      addressesToDisplayName: {},

      // Maps addresses to their relevant data
      holdersSummaries: [],
    };

    topHoldersByTime.topHolders.forEach(topHolder => {
      const percentageOfStake = (topHolder.tokens / totalTokensPerTimeFrame) * 100;

      dataForGraphs.addressesToPercentage[topHolder.address] = percentageOfStake;

      dataForGraphs.holdersSummaries.push({
        address: topHolder.address,
        tokens: topHolder.tokens,
        percentageOfStake,
        displayName: topHolder.displayName,
        roleDescription: generateHolderRoleDescription(topHolder),
      });

      dataForGraphs.addressesToDisplayName[topHolder.address] = topHolder.displayName;
    });

    return dataForGraphs;
  });

  // Extracts all of the addresses into a unique set
  const allEntities = topHoldersByTimes
    .map(topHoldersByTime => topHoldersByTime.topHolders.map(topHolder => topHolder.address))
    .flat(2);
  const uniqEntitiesAddresses = new Set<string>(allEntities);

  return {
    graphsData,
    uniqueAddresses: Array.from(uniqEntitiesAddresses.values()),
  };
}

/**
 * Generates the role description for the give holder.
 */
function generateHolderRoleDescription(holder: IHolderStakeSnapshot): string {
  let description = 'Unknown';

  if (holder.isExchange) {
    description = 'Exchange';
  } else if (holder.isGuardian) {
    description = 'Guardian';
  } else if (holder.isOrbsAddress) {
    description = 'Orbs LTD';
  }

  return description;
}
