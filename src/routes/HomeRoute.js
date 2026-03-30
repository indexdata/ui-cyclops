import React from 'react';
// import { stripesConnect } from '@folio/stripes/core';
import HomeView from '../views/HomeView';

/*
function HomeRoute(props) {
  const projectsResource = props.resources.projects;
  const loaded = projectsResource && projectsResource.hasLoaded;

  return <HomeView loaded={loaded} projects={projectsResource.records[0]} />;
}

HomeRoute.manifest = Object.freeze({
  projects: {
    type: 'okapi',
    path: 'cyclops/projects',
  }
});

export default stripesConnect(HomeRoute);
*/

// The real version is above. Until CCMS support projects, we dummy the data here

function HomeRoute() {
  const projectsProp = [
    { id: '123', name: 'Ukrainian Culture' },
    { id: '456', name: 'Literature of North Korea' },
    { id: '789', name: 'Palaeontology: the Bone Wars' },
  ];

  return <HomeView loaded projects={projectsProp} />;
}

HomeRoute.manifest = Object.freeze({
  projects: {
    type: 'okapi',
    path: 'cyclops/projects',
  }
});

export default HomeRoute;
