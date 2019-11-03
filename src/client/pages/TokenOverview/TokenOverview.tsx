/* tslint:disable:variable-name */
import React from 'react';

import {Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis} from 'recharts';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Nov', 'Dec'];
// const topHolders = Array(20).fill('').map(() => buildTokenHolder(1000));

const MILLION = 1_000_000;

const topHolders = [
    buildTokenHolder(124 * MILLION, 'Guardians of orbs'),
    buildTokenHolder(50 * MILLION),
    buildTokenHolder(27 * MILLION),
    buildTokenHolder(35 * MILLION),
    buildTokenHolder(10 * MILLION),
    buildTokenHolder(5 * MILLION),
    buildTokenHolder(700 * MILLION, 'ORBS-POS'),
    buildTokenHolder(43 * MILLION),
    buildTokenHolder(52 * MILLION),
    buildTokenHolder(35 * MILLION),
    buildTokenHolder(35 * MILLION),
    buildTokenHolder(35 * MILLION),
    buildTokenHolder(35 * MILLION, 'CryptoLat Co.'),
    buildTokenHolder(35 * MILLION),
    buildTokenHolder(15 * MILLION),
    buildTokenHolder(35 * MILLION),
    buildTokenHolder(40 * MILLION, 'Satoshi nakamoto'),
    buildTokenHolder(35 * MILLION),
    buildTokenHolder(35 * MILLION, 'El professor'),
    buildTokenHolder(25 * MILLION),
];

const ADDRESS_LENGTH = 20;

function buildTokenHolder(tokens: number, name?: string) {
    const generatedAddress = `0x${makeid(20)}`;

    const displayName = name ? name : generatedAddress;

    return {
        address: generatedAddress,
        name,
        tokens,
        displayName,
    };
}

function makeid(length) {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        // result += characters.charAt(Math.floor(Math.random() * charactersLength));
        result += characters[(Math.floor(Math.random() * charactersLength))];
    }

    return result;
}

function buildDemoData() {
    const demoData = months.map(month => {
        const holdersObject = {};

        topHolders.forEach(holder => {
           // Update amount
            const monthlyChange = Math.random() + 0.5;
            holder.tokens *= monthlyChange;
            holder.tokens = Math.floor(holder.tokens);

            holdersObject[holder.displayName] = holder.tokens;
        });

        return {
            month,
            ...holdersObject,
        };
    });

    return demoData;
}

const data = [
    {
        month: 'Jan', uv: 4000, pv: 2400, amt: 2400,
    },
    {
        month: 'Feb', uv: 3000, pv: 1398, amt: 2210,
    },
    {
        month: 'Mar', uv: 2000, pv: 9800, amt: 2290,
    },
    {
        month: 'Apr', uv: 2780, pv: 3908, amt: 2000,
    },
    {
        month: 'May', uv: 1890, pv: 4800, amt: 2181,
    },
    {
        month: 'Jun', uv: 2390, pv: 3800, amt: 2500,
    },
    {
        month: 'Jul', uv: 3490, pv: 4300, amt: 2100,
    },
];

const generatedDemoData = buildDemoData();

console.log(generatedDemoData);

const generateHexColor = () => '#'+ Math.floor(Math.random()*16777215).toString(16);


export const TokenOverview = () => {
    return (
        <div>

            Token Overview
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
                    return <Bar key={topHolder.displayName} dataKey={topHolder.displayName} stackId='a' fill={generateHexColor()} />
                })}
            </BarChart>
        </div>
    );
};
