import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React, { useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import equal from 'fast-deep-equal';
import { Route as NestedRoute } from '@folio/stripes-core';
import { NavContext } from './NavContext';
import Tabs from './Tabs';
import Settings from './settings';
import HomeRoute from './routes/HomeRoute';
import ProjectRoute from './routes/ProjectRoute';
import EditProjectRoute from './routes/EditProjectRoute';
import CreateProjectRoute from './routes/CreateProjectRoute';
import ListRoute from './routes/ListRoute';
import SpectreRoute from './routes/SpectreRoute';

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
        <Route path={`${path}/project/create`} exact component={CreateProjectRoute} />
        <Route path={`${path}/project/:projectId`} exact component={ProjectRoute} />
        <Route path={`${path}/project/:projectId/edit`} exact component={EditProjectRoute} />
        <NestedRoute path={`${path}/list/:projectId/:listId`} component={ListRoute}>
          <Route path={`${path}/list/:projectId/:listId/:spectreId`} exact component={SpectreRoute} />
        </NestedRoute>
      </Switch>
    </NavContext.Provider>
  );
}
