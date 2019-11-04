import React from 'react';
import {buildDemoData, generateHexColor, topHolders} from './tempDevHelpers';
import {Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis} from 'recharts';
import styled from 'styled-components';
import {Typography} from '@material-ui/core';

interface IProps {

}

const Section = styled('div')({
    maxWidth: '100%',
    width: '100%',
    border: '1px solid black'
});

const SectionHeader = styled(Typography)(({theme}) => ({
    color: theme.style.colors.lightText,
}));

export const TopTokenHoldersSection: React.FC<IProps> = (props: IProps) => {
    const generatedDemoData = buildDemoData();

    return (
  <Section>
      <SectionHeader variant={"h6"} >Top 20 token holders stake change </SectionHeader>
      <BarChart
          width={1000}
          height={1000}
          data={generatedDemoData}
          margin={{
              top: 20, right: 30, left: 20, bottom: 5,
          }}
      >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='month' />
          <YAxis />
          <Tooltip />
          <Legend />

          {topHolders.map((topHolder, index) => {
              return <Bar key={topHolder.displayName} dataKey={topHolder.displayName} stackId='a' fill={generateHexColor()} />;
          })}
      </BarChart>
  </Section>
 );
};