import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React, { useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import equal from 'fast-deep-equal';
import { NavContext } from './NavContext';
import Tabs from './Tabs';
import Settings from './settings';
import HomeRoute from './routes/HomeRoute';
import ProjectRoute from './routes/ProjectRoute';
import ListRoute from './routes/ListRoute';

export default function Cyclops(props) {
  const [Nav, setNav] = useState({
    home: {},
    project: {},
    list: {},
  });

  // Make mutator available to code tthat needs to mutate it
  Nav.update = (newValues) => {
    const newObject = { ...Nav, ...newValues };
    if (!equal(Nav, newObject)) setNav(newObject);
  };

  if (props.showSettings) {
    return <Settings {...props} />;
  }

  const path = props.match.path;
  return (
    <NavContext.Provider value={Nav}>
      <Tabs />
      <Switch>
        <Redirect exact from={path} to={`${path}/home`} />
        <Route path={`${path}/home`} exact component={HomeRoute} />
        <Route path={`${path}/project/:projectId`} exact component={ProjectRoute} />
        <Route path={`${path}/list/:projectId/:setId`} exact component={ListRoute} />
      </Switch>
    </NavContext.Provider>
  );
}
