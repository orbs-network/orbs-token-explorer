/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { getElementText } from './puppeteer-helpers';
export class HomePageDriver {
  public async navigate() {
    await page.setViewport({ width: 1600, height: 900 });
    await page.goto('http://localhost:3000');
  }

  public async waitForHomepage(): Promise<void> {
    await page.waitForSelector(`#home-page`);
  }

  public async getWelcomeGreeting(): Promise<string> {
    return await getElementText(`[data-testid="welcome-greeting"]`, page);
  }
}
