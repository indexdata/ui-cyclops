import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import ProjectView from '../views/ProjectView';

function ProjectRoute(props) {
  const projectResource = props.resources.project;
  const setsResource = props.resources.sets;
  const loaded = (setsResource && setsResource.hasLoaded &&
                  projectResource && projectResource.hasLoaded);

  return <ProjectView
    loaded={loaded}
    project={projectResource.records[0]}
    sets={setsResource.records[0]}
  />;
}

ProjectRoute.manifest = Object.freeze({
  project: {
    type: 'okapi',
    path: 'cyclops/projects/:{projectId}',
  },
  sets: {
    type: 'okapi',
    path: 'cyclops/sets',
  },
});

export default stripesConnect(ProjectRoute);
