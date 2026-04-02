import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import SpectreView from '../views/SpectreView';

function response2spectre(response) {
  if (!response) return undefined;

  const spectre = {};
  response.fields.forEach(({ name }, index) => {
    spectre[name] = response.data[0].values[index];
  });
  return spectre;
}

function SpectreRoute({ resources, match }) {
  const spectreResource = resources.spectre;
  const loaded = spectreResource && spectreResource.hasLoaded;
  const spectre = response2spectre(spectreResource.records[0]);

  return <SpectreView loaded={loaded} match={match} spectre={spectre} />;
}

SpectreRoute.manifest = Object.freeze({
  spectre: {
    type: 'okapi',
    path: 'cyclops/sets/:{setId}',
    params: {
      fields: '*',
      cond: (_, pathParams) => `id=${pathParams.spectreId}`,
    },
  }
});

export default stripesConnect(SpectreRoute);
