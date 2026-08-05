import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import ProjectView from '../views/ProjectView';
import { filtersForProject } from '../util';

function ProjectRoute(props) {
  const projectResource = props.resources.project;
  const setsResource = props.resources.sets;
  const loaded = (setsResource && setsResource.hasLoaded &&
                  projectResource && projectResource.hasLoaded);

  const populateList = async (setName, filterName) => {
    await props.mutator.populateTarget.update({ setName });
    return props.mutator.populateSet.POST({
      from: `${projectResource.records[0].id}.object`,
      cond: `filter(${filterName})`,
    });
  };

  return <ProjectView
    loaded={loaded}
    project={projectResource.records[0]}
    sets={setsResource.records[0]}
    filters={filtersForProject(props.resources.filters?.records?.[0]?.filters, props.match.params.projectId)}
    addList={(name, title) => props.mutator.allSets.POST(title ? { name, title } : { name })}
    populateList={populateList}
    deleteList={(id) => props.mutator.allSets.DELETE({ id })}
  />;
}

ProjectRoute.manifest = Object.freeze({
  project: {
    type: 'okapi',
    path: 'cyclops/projects/:{projectId}',
  },
  sets: {
    type: 'okapi',
    path: 'cyclops/projects/:{projectId}/sets',
  },
  filters: {
    type: 'okapi',
    path: 'cyclops/filters',
  },
  populateTarget: {},
  populateSet: {
    type: 'okapi',
    path: (_q, _p, resources) => `cyclops/sets/${resources.populateTarget?.setName}/add`,
    fetch: false,
    throwErrors: false,
  },
  allSets: {
    type: 'okapi',
    path: 'cyclops/sets',
    fetch: false,
    POST: {
      throwErrors: false,
    },
    DELETE: {
      throwErrors: false,
    },
  },
});

export default stripesConnect(ProjectRoute);
