/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { ITopHoldersAtTime } from '../../shared/serverResponses/bi/serverBiResponses';

export interface IDB {
  rebuild(): Promise<void>;
  init(): Promise<void>;
  destroy(): Promise<void>;

  getTopTokenHolders(): Promise<ITopHoldersAtTime[]>;
}
