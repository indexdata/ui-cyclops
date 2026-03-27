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
      cond: (_a, _b, resources) => {
        const query = resources.query.query;
        const qindex = resources.query.qindex;
        if (!query || !qindex) return undefined;
        return `${qindex} = '${query}'`;
      },
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
      // offset: '200', // Paging not yet implemented
      limit: '100',
      // XXX The following are not yet supported by CCMS
      // filter: 'jurassic',
      // tag: 'dino,ptero',
    },
  }
});

export default stripesConnect(SpectresRoute);
