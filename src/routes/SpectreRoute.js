import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import SpectreView from '../views/SpectreView';
import { idCond } from '../util';

function response2spectre(response) {
  if (!response) return undefined;

  const spectre = {};
  response.fields.forEach(({ name }, index) => {
    spectre[name] = response.data[0].values[index];
  });
  return spectre;
}

function SpectreRoute({ resources, mutator, match }) {
  const spectreResource = resources.spectre;
  const projectResource = resources.project;
  const loaded = (spectreResource && spectreResource.hasLoaded &&
                  projectResource && projectResource.hasLoaded);
  const spectre = response2spectre(spectreResource.records[0]);

  const project = projectResource.records[0] || {};

  return (
    <SpectreView
      loaded={loaded}
      match={match}
      project={project}
      spectre={spectre}
      mutator={mutator}
    />
  );
}

SpectreRoute.manifest = Object.freeze({
  spectre: {
    type: 'okapi',
    path: 'cyclops/sets/:{listId}',
    params: {
      fields: '*, source_record',
      jsonCond: (_, pathParams) => JSON.stringify(idCond(pathParams.spectreId)),
    },
  },
  spectreUpdate: {
    type: 'okapi',
    path: 'cyclops/sets/:{listId}/:{spectreId}',
    fetch: false,
    clientGeneratePk: false,
    throwErrors: false,
  },
  project: {
    type: 'okapi',
    path: 'cyclops/projects/:{projectId}',
  },
});

export default stripesConnect(SpectreRoute);
