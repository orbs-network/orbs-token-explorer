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
import {Button, colors, Icon, Snackbar, SnackbarContent, Typography} from '@material-ui/core';
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

const SectionHeader = styled('div')(({theme}) => ({
    color: theme.style.colors.lightText,
    flexDirection: 'row',
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between'
}));

const SectionHeaderTitle = styled(Typography)(({theme}) => ({}));

const SectionHeaderActionButton = styled(Button)(({theme}) => ({
    color: 'inherit',
}));

const SuccessSnackbarContent = styled(SnackbarContent)(({theme}) => ({
    backgroundColor: Green[600],
}));

const TINE_UNIT_NAME_KEY = 'timeUnitName';

const useBarCharts = (barsData, uniqueNames: string[], barClickHandler) => {
    const barsForeachName = useMemo(() => {
        return uniqueNames.map((topHolderName, index) => {
            return (
                <Bar key={topHolderName}
                     onClick={barClickHandler}
                     dataKey={`barsData.${topHolderName}`}
                     stackId='a'
                     fill={colorFromHolderName(topHolderName)}
                     unit={'%'}
                     name={topHolderName}
                />
            );
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

        return Object.entries(singleTImeUnitObject.pieData).map(([k, v], i) => ({  name: k, value: v, displayName: singleTImeUnitObject.addressesToDisplayName[k] }));
    }, [singleTImeUnitObject]);

    const onCellClickBuilder = useCallback(address => {
        return () => {
            copyToClipboard(address);
        };
    }, []);

    const pieCells = useMemo(() => {
        return nameValuePairs.map((entry, i) => (<Cell displayName={entry.displayName} key={`cell-${i}`} fill={colorFromHolderName(entry.name)} stroke={'black'} onClick={onCellClickBuilder(entry.name)} />));
    }, [nameValuePairs]);

    if (!nameValuePairs.length) {
        return <div> No holders </div>;
    }

    return <PieChart >
        <Pie  animationBegin={0} animationDuration={1000} data={nameValuePairs} dataKey='value' nameKey='name'  outerRadius={'40em'} fill='#8884d8' label labelLine={false} >
            {pieCells}
        </Pie>
        <Tooltip formatter={toolTipFormatterForPie}/>
    </PieChart>;
};

export const TopTokenHoldersSection: React.FC<IProps> = (props: IProps) => {
    const { isLoading, topHoldersByTimeList } = props;

    const showSnackbar = useBoolean(false);
    const selectedTimeUnitFocus = useStateful(null);

    const { barsData, uniqueAddresses } = useMemo(() => {
       if (!topHoldersByTimeList) {
           return {
               barsData: [],
               uniqueAddresses: [],
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

    const DisplayAsBarChart = useBarCharts(barsData, uniqueAddresses, barClickHandler);

    const DisplayAsPieChart = usePieChart(dataObjectForFocus, copyToClipboardAndNotify);

    const displaysPieChart = !!selectedTimeUnitFocus.value;

    return (
        <Section style={{ height: '50em'}}>
            {/* Header */}
            <SectionHeader>
                <SectionHeaderTitle variant={'h6'} >
                    Top token holders as percentage of circulation
                </SectionHeaderTitle>
                {displaysPieChart && <SectionHeaderActionButton onClick={() => selectedTimeUnitFocus.setValue(null)} > Back to graph </SectionHeaderActionButton>}
            </SectionHeader>

            {/* For loading */}
            <ClipLoader loading={isLoading} />

            {!isLoading && <>
                <ResponsiveContainer>
                    {displaysPieChart ? DisplayAsPieChart : DisplayAsBarChart}
                </ResponsiveContainer>
            </>}

            {/* The snackbar for alerts */}
            <Snackbar open={showSnackbar.value} autoHideDuration={1000}  onClose={showSnackbar.setFalse} >
                <SuccessSnackbarContent message={`Copied address to clipboard !`} />
            </Snackbar>
        </Section>
    );
};

function toolTipFormatter(value: number, name: string,
                           entry: TooltipPayload, index: number) {
    return [`${value.toFixed(3)} `, entry.payload.addressesToDisplayName[name]];
}

function toolTipFormatterForPie(value: number, name: string,
                          entry: TooltipPayload, index: number) {
    return [value.toFixed(4), entry.payload.displayName];
}

function colorFromHolderName(name: string): string {
    const rand = genRandom.create(name);
    // DEV_NOTE : starting from 200 to prevent very light (unreadable) colors
    // @ts-ignore
    const shade: 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900  = (rand(4) + 5 ) * 100;
    const color = toMaterialStyle(name, shade).backgroundColor;

    return color;
}

function toBarData(topHoldersByTimes: ITopHoldersAtTime[]): { barsData: object[], uniqueAddresses: string[]} {
    const barsData = topHoldersByTimes.map(topHoldersByTime => {
        const totalTokensPerTimeFrame = topHoldersByTime.totalTokens;

        const timeUnitName = moment.utc(topHoldersByTime.timestamp * 1000).format('MMM/YY');

        const barData = {
            // This is the value that will be display as the 'X' axis value
            timeUnitName,

            // Meta data about the time
            timestamp: topHoldersByTime.timestamp,

            // here we will put all of the bars data for
            barsData: {

            },

            // here we will put all of the pie data for
            pieData: {

            },

            addressesToDisplayName : {

            },
        };

        topHoldersByTime.topHolders.forEach(topHolder => {
            const percentageOfStake = (topHolder.tokens / totalTokensPerTimeFrame) * 100;

            barData.barsData[topHolder.address] = percentageOfStake;
            barData.pieData[topHolder.address] = percentageOfStake;

            barData.addressesToDisplayName[topHolder.address] = topHolder.displayName;
        });

        return barData;
    });

    const allEntities = (topHoldersByTimes.map(topHoldersByTime => topHoldersByTime.topHolders.map(topHolder => topHolder.address))).flat(2);
    const uniqEntitiesAddresses = new Set<string>(allEntities);

    return {
        barsData,
        uniqueAddresses: Array.from(uniqEntitiesAddresses.values()),
    };
}