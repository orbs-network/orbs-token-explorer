import React from 'react';
import {buildDemoData, generateHexColor, topHolders} from './tempDevHelpers';
import {Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis} from "recharts";

interface IProps {

}

export const TopTokenHoldersSection: React.FC<IProps> = (props: IProps) => {
    const generatedDemoData = buildDemoData();

    return (
  <div>
      TopTokenHoldersSection
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
  </div>
 );
};