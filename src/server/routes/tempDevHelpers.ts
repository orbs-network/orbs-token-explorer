import {IHolderStake, ITopHoldersAtTime} from '../../shared/serverResponses/bi/serverBiResponses';
import Moment from 'moment';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Nov', 'Dec'];
// const topHolders = Array(20).fill('').map(() => buildTokenHolder(1000));

const MILLION = 1_000_000;

export const topHoldersList = [
    buildTokenHolder(124 * MILLION, 'Guardians of orbs'),
    buildTokenHolder(50 * MILLION),
    buildTokenHolder(270 * MILLION),
    buildTokenHolder(35 * MILLION),
    buildTokenHolder(10 * MILLION),
    buildTokenHolder(5 * MILLION),
    buildTokenHolder(500 * MILLION, 'ORBS-POS'),
    buildTokenHolder(43 * MILLION),
    buildTokenHolder(52 * MILLION),
    buildTokenHolder(35 * MILLION),
    buildTokenHolder(320 * MILLION),
    buildTokenHolder(35 * MILLION),
    buildTokenHolder(35 * MILLION, 'CryptoLat Co.'),
    buildTokenHolder(35 * MILLION),
    buildTokenHolder(15 * MILLION),
    buildTokenHolder(35 * MILLION),
    buildTokenHolder(40 * MILLION, 'Satoshi Nakamoto'),
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

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

export function buildDemoData(): ITopHoldersAtTime[] {
    const clonedHoldersList = topHoldersList.map(holder => ({...holder}));

    const demoData = months.map(month => {

        // Update tokens
        const topHolders: IHolderStake[] = clonedHoldersList.map(holder => {
            const holderStake: IHolderStake = {
                displayName: holder.displayName,
                tokens: holder.tokens,
                address: holder.address,
                isOrbsAddress: false,
            };

            // Update amount
            const min = 0.8;
            const max = 1.2;
            const monthlyChange = (Math.random() * (max - min) + min);

            holder.tokens *= monthlyChange;
            holder.tokens = Math.floor(holder.tokens);

            return holderStake;
        });

        const topHoldersAtTime: ITopHoldersAtTime = {
            totalTokens: 2_000_000_000,
            timestamp: Moment.utc(`${month} 2019`, 'MMM YYYY').unix(),
            topHolders,
        };

        return topHoldersAtTime;
    });

    return demoData;
}