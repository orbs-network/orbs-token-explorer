import axios from 'axios';

import { IAPITopHoldersResponse } from '../../shared/serverResponses/bi/serverBiResponses';

export interface IOrbsBiService {
  getTopHoldersForPastYear(holdersAmount): Promise<IAPITopHoldersResponse>;
}

export class OrbsBiService implements IOrbsBiService {
  public async getTopHoldersForPastYear(holdersAmount): Promise<IAPITopHoldersResponse> {
    try {
      const res = await axios.get<IAPITopHoldersResponse>('/api/token-dist/top-holders', {
        withCredentials: true,
      });

      return res.data;
    } catch (e) {
      if (e.response && e.response.request.status === 400) {
        throw new Error(e.response.data);
      } else {
        throw e;
      }
    }
  }
}
