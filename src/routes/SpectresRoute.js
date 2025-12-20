import React from 'react';
import { Link } from 'react-router-dom';
import { stripesConnect } from '@folio/stripes/core';
import { Pane, Paneset } from '@folio/stripes/components';
import NewAppGreeting from '../components/new-app-greeting';

function SpectresRoute(props) {
  return (
    <Paneset>
      <Pane defaultWidth="fill" fluidContentWidth paneTitle="ui-cyclops">
        <NewAppGreeting />
        <br />
        <ul>
          <li data-test-application-examples>
            View the
            {' '}
            <Link to={`${props.match.path}/examples`}>examples page</Link>
            {' '}
            to see some useful components.
          </li>
          <li data-test-application-guide>
            Please refer to the
            {' '}
            <a href="https://github.com/folio-org/stripes/blob/master/doc/dev-guide.md">
              Stripes Module Developer&apos;s Guide
            </a>
            {' '}
            for more information.
          </li>
        </ul>
      </Pane>
    </Paneset>
  );
}

export default stripesConnect(SpectresRoute);
