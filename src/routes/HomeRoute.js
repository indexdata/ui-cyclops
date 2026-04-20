import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import HomeView from '../views/HomeView';

function HomeRoute(props) {
  const projectsResource = props.resources.projects;
  const loaded = projectsResource && projectsResource.hasLoaded;

  return <HomeView loaded={loaded} projects={projectsResource.records?.[0]} />;
}

HomeRoute.manifest = Object.freeze({
  projects: {
    type: 'okapi',
    path: 'cyclops/projects',
  }
});

export default stripesConnect(HomeRoute);
