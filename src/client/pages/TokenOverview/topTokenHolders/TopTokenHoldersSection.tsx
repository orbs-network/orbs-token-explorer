import React, { useMemo } from 'react';
import {Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import {Typography} from '@material-ui/core';
import { ClipLoader } from 'react-spinners';
import {ITopHoldersAtTime} from '../../../../shared/serverResponses/bi/serverBiResponses';
import moment from 'moment';

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

export const TopTokenHoldersSection: React.FC<IProps> = (props: IProps) => {
    const { isLoading, topHoldersByTimeList } = props;

    const barsData = useMemo(() => {
       if (! topHoldersByTimeList) {
           return [];
       }

       return  toBarData(topHoldersByTimeList);
    }, [topHoldersByTimeList]);

    return (
        <Section style={{ height: '30em'}}>
            <SectionHeader variant={'h6'} >Top 20 token holders stake change</SectionHeader>

            <ClipLoader loading={isLoading} />

            {!isLoading && <ResponsiveContainer>
                <BarChart
                    data={barsData}
                    margin={{
                        top: 20, right: 30, left: 50, bottom: 50,
                    }}
                    // stackOffset={'expand'}
                >
                    {/*<CartesianGrid strokeDasharray='3 3' />*/}
                    {/*<XAxis dataKey='month' />*/}
                    <XAxis dataKey='timeUnitName' domain={[0, 100]}/>
                    <YAxis />
                    <Tooltip />
                    {/*<Legend />*/}

                    {Object.keys(barsData[0]).filter(k => k !== 'timeUnitName').map((topHolderName, index) => {
                        return <Bar key={topHolderName} dataKey={topHolderName} stackId='a' fill={colorByIndex(index)} />;
                    })}
                </BarChart>
            </ResponsiveContainer>}
        </Section>
    );
};

function toBarData(topHoldersByTimes: ITopHoldersAtTime[]) {
    const barsData = topHoldersByTimes.map(topHoldersByTime => {
        const totalTokensPerTimeFrame = topHoldersByTime.totalTokens;

        const timeUnitName = moment.utc(topHoldersByTime.timestamp * 1000).format('MMM');

        const barData = {
            timeUnitName,
        };

        topHoldersByTime.topHolders.forEach(topHolder => {
            const percentageOfStake = (topHolder.tokens / totalTokensPerTimeFrame) * 100;

            barData[topHolder.displayName] = percentageOfStake;
        });

        return barData;
    });

    return barsData;
}

const colorsToUse = [
  '#C90013',
  '#FF5733',
  '#D79B70',
  '#DBEC0B',
  '#EFC600',
  '#BDC53F',
  '#D4DA17',
  '#98B863',
  '#15A244',
  '#133A83',

  '#48357D',
  '#6C3285',
    '#A217DA',
    '#B86373',

  '#32D7A0',
  '#0BE9EC',
    '#0BA57E',
  '#4D4C09',
  '#94A0BD',
  '#83708D',

];

const redColorHues = [
    '#6A0108',
    '#74080C',
    '#7F1011',
    '#891915',
    '#93211B',
    '#9D2920',
    '#A63226',
    '#AF3B2C',
    '#B84433',
    '#C14D3A',
    '#C85641',
    '#D06049',
    '#D76A51',
    '#DD745A',
    '#E37E63',
    '#E8896D',
    '#EC9376',
    '#F09E81',
    '#F3AA8C',
    '#F5B597'
].reverse();

const yellowToGreenVisualization = [
    '#31323D',
'#353B47',
'#394551',
'#3B4F5A',
'#3E5962',
'#40646A',
'#436E72',
'#467978',
'#4A847D',
'#508F82',
'#579985',
'#60A488',
'#6AAF8A',
'#77B98B',
'#85C48B',
'#94CE8B',
'#A5D88B',
'#B8E18B',
'#CCEA8A',
'#E0F38B'
]


function colorByIndex(index: number) {
    return colorsToUse[index];
    // return index < 10 ? redColorHues[index] : yellowToGreenVisualization[index];
}