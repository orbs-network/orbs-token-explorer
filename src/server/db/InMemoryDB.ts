/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { IDB } from './IDB';

export class InMemoryDB implements IDB {
  private dbVersion: string = '0.0.0';

  public async init(): Promise<void> {
  }

  public async rebuild(): Promise<void> {
    // nothing to rebuild...
  }

  public async destroy(): Promise<void> {
    // nothing to destroy...
  }

  public async getTopTokenHolders() {
    return [];
  }
}
