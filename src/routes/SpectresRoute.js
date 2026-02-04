import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import SpectresView from '../views/SpectresView';

function SpectresRoute(props) {
  const spectresResource = props.resources.spectres;
  const loaded = spectresResource && spectresResource.hasLoaded;

  return <SpectresView loaded={loaded} spectres={spectresResource.records[0]} />;
}

SpectresRoute.manifest = Object.freeze({
  spectres: {
    type: 'okapi',
    path: 'cyclops/sets/:{setId}',
    params: {
      fields: '*',
      // XXX The following do not seem to be supported yet
      // cond: '143100000 <= age AND age <= 201400000',
      // filter: 'jurassic',
      // tag: 'dino,ptero',
      // sort: 'author,title',
      // offset: '200',
      limit: '100',
    },
  }
});

export default stripesConnect(SpectresRoute);
