/**
 * Copyright 2019 the orbs-token-explorer authors
 * This file is part of the orbs-token-explorer library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import * as React from 'react';
import { Home } from "../components/Home";

describe('<Home/>', () => {
  it('should display welcome message', () => {
    const {getByTestId} = render(
      <Home/>,
    )
    expect(getByTestId('welcome-greeting')).toHaveTextContent('Welcome to the ORBs token explorer');
  });
});
