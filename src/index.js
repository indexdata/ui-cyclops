import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import SpectresRoute from './routes/SpectresRoute';
import ExamplePageRoute from './routes/ExamplePageRoute';
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
        component={SpectresRoute}
      />
      <Route
        path={`${path}/examples`}
        exact
        component={ExamplePageRoute}
      />
    </Switch>
  );
}
