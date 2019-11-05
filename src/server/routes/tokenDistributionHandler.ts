import {ITopHoldersAtTime} from '../../shared/serverResponses/bi/serverBiResponses';
import {buildDemoData} from './tempDevHelpers';

export function getTopHolders(): ITopHoldersAtTime[] {
    const topHoldersAtTimePoints = buildDemoData();

    return topHoldersAtTimePoints;
}