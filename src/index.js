import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Tabs from './Tabs';
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
    <>
      <Tabs />
      <Switch>
        <Redirect exact from={path} to={`${path}/lists`} />
        <Route path={path} exact component={SetsRoute} />
        <Route path={`${path}/lists`} exact component={SetsRoute} />
        <Route path={`${path}/spectres/:setId`} exact component={SpectresRoute} />
      </Switch>
    </>
  );
}
