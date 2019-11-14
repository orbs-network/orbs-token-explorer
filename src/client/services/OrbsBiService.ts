import axios from 'axios';

import {IAPITopHoldersResponse} from '../../shared/serverResponses/bi/serverBiResponses';

export interface IOrbsBiService {
    getTopHoldersForPastYear(holdersAmount): Promise<IAPITopHoldersResponse>;
}

export class OrbsBiService implements IOrbsBiService {
    public async getTopHoldersForPastYear(holdersAmount): Promise<IAPITopHoldersResponse> {
        const res = await axios.get<IAPITopHoldersResponse>('/api/token-dist/top-holders');

        return res.data;
    }
}