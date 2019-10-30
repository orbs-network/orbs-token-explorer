/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import axios from 'axios';
import { ISomeData } from '../../shared/ISomeData';

// EXAMPLE //
export async function getSomeData(name: string): Promise<ISomeData> {
  return axios.get(`/api/some-data/${name}`).then(res => res.data as ISomeData);
}

// EXAMPLE //
export async function storeSomeData(someData: ISomeData): Promise<void> {
  return axios.post(`/api/some-data`, { someData }).then(res => res.data);
}
