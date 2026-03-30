import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import ListView from '../views/ListView';

function ListRoute({ resources, mutator, match }) {
  const spectresResource = resources.spectres;
  const loaded = spectresResource && spectresResource.hasLoaded;

  return <ListView
    loaded={loaded}
    name={match.params.setId}
    spectres={spectresResource.records[0]}
    query={resources.query}
    updateQuery={mutator.query.update}
  />;
}

ListRoute.manifest = Object.freeze({
  query: {},
  spectres: {
    type: 'okapi',
    path: 'cyclops/sets/:{setId}',
    params: {
      fields: '*',
      cond: (_a, _b, resources) => {
        const clauses = [];

        const query = resources.query.query;
        const qindex = resources.query.qindex;
        if (query && qindex) {
          clauses.push(`${qindex} = '${query}'`);
        }

        const availability = resources.query.availability;
        if (availability) {
          clauses.push(`availability = '${availability}'`);
        }

        return clauses.join(' and ');
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

export default stripesConnect(ListRoute);
