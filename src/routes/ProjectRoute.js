import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import ProjectView from '../views/ProjectView';

function ProjectRoute(props) {
  const setsResource = props.resources.sets;
  const loaded = setsResource && setsResource.hasLoaded;

  return <ProjectView
    loaded={loaded}
    project={{
      // Dummy project until we can load from CCMS
      id: '123',
      name: 'Ukrainian Culture',
    }}
    sets={setsResource.records[0]}
  />;
}

ProjectRoute.manifest = Object.freeze({
  sets: {
    type: 'okapi',
    path: 'cyclops/sets',
  }
});

export default stripesConnect(ProjectRoute);
