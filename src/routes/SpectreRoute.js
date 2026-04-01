import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import SpectreView from '../views/SpectreView';

function SpectreRoute({ resources, match }) {
  const spectreResource = resources.spectre;
  const loaded = spectreResource && spectreResource.hasLoaded;

  return <SpectreView match={match} spectre={spectreResource.records[0]} />;
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
