import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import SetsView from '../views/SetsView';

function SetsRoute(props) {
  const setsResource = props.resources.sets;
  const loaded = setsResource && setsResource.hasLoaded;

  return <SetsView loaded={loaded} sets={setsResource.records[0]} />;
}

SetsRoute.manifest = Object.freeze({
  sets: {
    type: 'okapi',
    path: 'cyclops/sets',
  }
});

export default stripesConnect(SetsRoute);
