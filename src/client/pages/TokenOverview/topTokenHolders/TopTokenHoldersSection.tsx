import React, {useCallback, useMemo} from 'react';
import {
    Bar,
    BarChart,
    Tooltip,
    XAxis,
    YAxis,
    ResponsiveContainer,
    TooltipPayload, PieChart, Pie, Cell, Legend
} from 'recharts';
import styled from 'styled-components';
import {colors, Icon, Snackbar, SnackbarContent, Typography} from '@material-ui/core';
import { ClipLoader } from 'react-spinners';
import {ITopHoldersAtTime} from '../../../../shared/serverResponses/bi/serverBiResponses';
import moment from 'moment';
import toMaterialStyle from 'material-color-hash';
import genRandom from 'random-seed';
import { useStateful, useBoolean } from 'react-hanger';
import copyTextToClipboard from 'copy-text-to-clipboard';
import Green from '@material-ui/core/colors/green';
import AssignmentTwoToneIcon from '@material-ui/icons/AssignmentTwoTone';

interface IProps {
    isLoading: boolean;
    topHoldersByTimeList: ITopHoldersAtTime[];
}

const Section = styled('div')({
    width: '100%',
    border: '1px solid black'
});

const SectionHeader = styled(Typography)(({theme}) => ({
    color: theme.style.colors.lightText,
}));

const SuccessSnackbarContent = styled(SnackbarContent)(({theme}) => ({
    backgroundColor: Green[600],
}));

const TINE_UNIT_NAME_KEY = 'timeUnitName';

const useBarCharts = (barsData, uniqueNames: string[], barClickHandler) => {
    const barsForeachName = useMemo(() => {
        return uniqueNames.map((topHolderName, index) => {
            return (<Bar key={topHolderName}  onClick={barClickHandler}
            dataKey={`data.${topHolderName}`} stackId='a' fill={colorFromHolderName(topHolderName)} />);
        });
    }, [uniqueNames]);

    const DisplayAsBarChart = useMemo(() => {
        return <BarChart
            data={barsData}
            margin={{
                top: 20, right: 30, left: 50, bottom: 50,
            }}
        >
            <XAxis dataKey={TINE_UNIT_NAME_KEY} />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={toolTipFormatter} />

            {barsForeachName}
        </BarChart>;
    }, [barsData, barsForeachName, ]);

    return DisplayAsBarChart;
};

const usePieChart = (singleTImeUnitObject, copyToClipboard: (text: string) => void) => {
    // Convert the 'data' to 'name'-'value' objects to fit the pie chart.
    const nameValuePairs = useMemo(() => {
        if (!singleTImeUnitObject) {
            return [];
        }

        return Object.entries(singleTImeUnitObject.data).map(([k, v], i) => ({  name: k, value: v }));
    }, [singleTImeUnitObject]);

    const onCellClickBuilder = useCallback(address => {
        return () => {
            copyToClipboard(address);
        };
    }, []);

    if (!nameValuePairs.length) {
        return <div> No holders </div>;
    }

    return <PieChart >
        <Pie  animationBegin={0} animationDuration={1000} data={nameValuePairs} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={'40em'} fill='#8884d8' label >
            {nameValuePairs.map((entry, i) => (<Cell key={`cell-${i}`} fill={colorFromHolderName(entry.name)} stroke={'black'} onClick={onCellClickBuilder(entry.name)} />))}
        </Pie>
        <Tooltip />
    </PieChart>;
};

export const TopTokenHoldersSection: React.FC<IProps> = (props: IProps) => {
    const { isLoading, topHoldersByTimeList } = props;

    const showSnackbar = useBoolean(false);
    const selectedTimeUnitFocus = useStateful(null);

    const { barsData, uniqueNames } = useMemo(() => {
       if (!topHoldersByTimeList) {
           return {
               barsData: [],
               uniqueNames: [],
           };
       }

       return toBarData(topHoldersByTimeList);
    }, [topHoldersByTimeList]);

    const dataObjectForFocus = useMemo(() => {
        if (!selectedTimeUnitFocus.value) {
            return null;
        }

        return barsData.filter(dataObject => dataObject[TINE_UNIT_NAME_KEY] === selectedTimeUnitFocus.value)[0];
    }, [barsData, selectedTimeUnitFocus.value]);

    const barClickHandler = useCallback((xAxisGroup: {[TINE_UNIT_NAME_KEY]: string}) => {
        const dateName = xAxisGroup[TINE_UNIT_NAME_KEY];

        selectedTimeUnitFocus.setValue(dateName);
    }, [selectedTimeUnitFocus]);

    const copyToClipboardAndNotify = useCallback(address => {
            copyTextToClipboard(address);
            showSnackbar.setTrue();
    }, []);

    const DisplayAsBarChart = useBarCharts(barsData, uniqueNames, barClickHandler);

    const DisplayAsPieChart = usePieChart(dataObjectForFocus, copyToClipboardAndNotify);

    return (
        <Section style={{ height: '50em'}}>
            <SectionHeader variant={'h6'} >Top token holders as percentage of circulation</SectionHeader>

            <ClipLoader loading={isLoading} />

            {!isLoading &&
            <ResponsiveContainer>
                {dataObjectForFocus ? DisplayAsPieChart : DisplayAsBarChart}
            </ResponsiveContainer>}

            {/* The snackbar for alerts */}
            <Snackbar open={showSnackbar.value} autoHideDuration={1000}  onClose={showSnackbar.setFalse} >
                <SuccessSnackbarContent message={`Copied address to clipboard !`} />
            </Snackbar>
        </Section>
    );
};

function toolTipFormatter(value: number, name: string,
                          entry: TooltipPayload, index: number) {
    return value.toFixed(3);
}

function colorFromHolderName(name: string): string {
    const rand = genRandom.create(name);
    // DEV_NOTE : starting from 200 to prevent very light (unreadable) colors
    // @ts-ignore
    const shade: 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900  = (rand(7) + 2 ) * 100;
    const color = toMaterialStyle(name, shade).backgroundColor;

    return color;
}

function toBarData(topHoldersByTimes: ITopHoldersAtTime[]): { barsData: object[], uniqueNames: string[]} {
    const barsData = topHoldersByTimes.map(topHoldersByTime => {
        const totalTokensPerTimeFrame = topHoldersByTime.totalTokens;

        const timeUnitName = moment.utc(topHoldersByTime.timestamp * 1000).format('MMM/YY');

        const barData = {
            timeUnitName,
            timestamp: topHoldersByTime.timestamp,
            data: {

            }
        };

        topHoldersByTime.topHolders.forEach(topHolder => {
            const percentageOfStake = (topHolder.tokens / totalTokensPerTimeFrame) * 100;

            barData.data[topHolder.displayName] = percentageOfStake.toFixed(4);
            barData.data[topHolder.displayName] = percentageOfStake;
        });

        return barData;
    });

    const allEntities = (topHoldersByTimes.map(topHoldersByTime => topHoldersByTime.topHolders.map(topHolder => topHolder.displayName))).flat(2);
    const uniqEntities = new Set<string>(allEntities);

    return {
        barsData,
        uniqueNames: Array.from(uniqEntities.values()),
    };
}