/**
 * Copyright 2019 the prism authors
 * This file is part of the prism library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { HomePageDriver } from './home-page-driver';

describe('Homepage', () => {
  const mainPageDriver = new HomePageDriver();

  beforeAll(async () => {
    await mainPageDriver.navigate();
    jest.setTimeout(20000);
  });

  it('should display the homepage welcome', async () => {
    await mainPageDriver.waitForHomepage();
    const welcomeGreeting = await mainPageDriver.getWelcomeGreeting();

    expect(welcomeGreeting).toEqual('Welcome to the ORBs token explorer');
  });
});
