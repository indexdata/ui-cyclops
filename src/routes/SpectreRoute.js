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

  // Populate the Fund dropdown from the funds defined on the associated
  // project rather than the global fund list. Project funds are stored as
  // { id, name }; map them to the { name, title } shape ActionSection expects,
  // keying the option value on the fund id (which is what spectre.fund holds).
  const projectFunds = (projectResource.records[0] || {}).funds || [];
  const funds = projectFunds.map(f => ({ name: f.id, title: f.name }));

  return (
    <SpectreView
      loaded={loaded}
      match={match}
      project={projectResource.records[0]}
      spectre={spectre}
      funds={funds}
      mutator={mutator}
    />
  );
}

SpectreRoute.manifest = Object.freeze({
  spectre: {
    type: 'okapi',
    path: 'cyclops/sets/:{setId}',
    params: {
      fields: '*',
      jsonCond: (_, pathParams) => JSON.stringify(idCond(pathParams.spectreId)),
    },
  },
  spectreUpdate: {
    type: 'okapi',
    path: 'cyclops/sets/:{setId}/:{spectreId}',
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
