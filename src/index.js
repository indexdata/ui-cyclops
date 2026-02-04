import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import SetsRoute from './routes/SetsRoute';
import SpectresRoute from './routes/SpectresRoute';
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
      <Route path={path} exact component={SetsRoute} />
      <Route path={`${path}/set/:setId`} exact component={SpectresRoute} />
    </Switch>
  );
}
