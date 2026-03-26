import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import SpectresView from '../views/SpectresView';

function SpectresRoute({ resources, mutator, match }) {
  const spectresResource = resources.spectres;
  const loaded = spectresResource && spectresResource.hasLoaded;

  return <SpectresView
    loaded={loaded}
    name={match.params.setId}
    spectres={spectresResource.records[0]}
    query={resources.query}
    updateQuery={mutator.query.update}
  />;
}

SpectresRoute.manifest = Object.freeze({
  query: {},
  spectres: {
    type: 'okapi',
    path: 'cyclops/sets/:{setId}',
    params: {
      fields: '*',
      // XXX This is not yet implemented
      // cond: '143100000 <= age AND age <= 201400000',
      // XXX The following do not seem to be supported yet
      // filter: 'jurassic',
      // tag: 'dino,ptero',
      sort: (_a, _b, resources) => {
        const s = resources.query.sort;
        if (!s) {
          return undefined;
        } else if (s.startsWith('-')) {
          return s.replace('-', '') + ' desc';
        } else {
          return s;
        }
      },
      // offset: '200',
      limit: '100',
    },
  }
});

export default stripesConnect(SpectresRoute);
