import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import ProjectView from '../views/ProjectView';

function ProjectRoute(props) {
  const projectResource = props.resources.project;
  const listsResource = props.resources.lists;
  const loaded = (listsResource && listsResource.hasLoaded &&
                  projectResource && projectResource.hasLoaded);

  const populateList = async (listName, filterName) => {
    await props.mutator.listToPopulate.update({ name: listName });
    return props.mutator.populateList.POST({
      from: `${projectResource.records[0].id}.object`,
      jsonCond: { type: 'filter', name: filterName },
    });
  };

  return <ProjectView
    loaded={loaded}
    project={projectResource.records[0]}
    lists={listsResource.records[0]}
    filters={props.resources.filters?.records?.[0]?.filters || []}
    addList={(name, title) => props.mutator.allLists.POST(title ? { name, title } : { name })}
    populateList={populateList}
    deleteList={(id) => props.mutator.allLists.DELETE({ id })}
  />;
}

ProjectRoute.manifest = Object.freeze({
  project: {
    type: 'okapi',
    path: 'cyclops/projects/:{projectId}',
  },
  lists: {
    type: 'okapi',
    path: 'cyclops/projects/:{projectId}/sets',
  },
  filters: {
    type: 'okapi',
    path: 'cyclops/filters',
    params: { project: ':{projectId}' },
  },
  listToPopulate: {},
  populateList: {
    type: 'okapi',
    path: (_q, _p, resources) => `cyclops/sets/${resources.listToPopulate?.name}/add`,
    fetch: false,
    throwErrors: false,
  },
  allLists: {
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
