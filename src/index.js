import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import Application from './routes/application';
import ExamplePage from './routes/example-page';
import Settings from './settings';

export default function Cyclops(props) {
  const {
    showSettings,
    match: {
      path
    }
  } = props;

  if (showSettings) {
    return <Settings {...props} />;
  }

  return (
    <Switch>
      <Route
        path={path}
        exact
        component={Application}
      />
      <Route
        path={`${path}/examples`}
        exact
        component={ExamplePage}
      />
    </Switch>
  );
}
