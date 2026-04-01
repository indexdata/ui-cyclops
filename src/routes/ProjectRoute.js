import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import ProjectView from '../views/ProjectView';

// Dummy project until we can load a real one from CCMS
const dummyProject = {
  id: '123',
  name: 'Slavic Studies',
  altName: 'palci_slavic',
  mou: 'https://www.miketaylor.org.uk/dino/pubs/',
  fund: 'PALCI cultural preservation',
  people: [
    {
      name: 'Boaz (Lehigh)',
      role: 'Admin',
      // XXX what else goes in here?

    },
    {
      name: 'Sebastian (Index Data)',
      role: 'Visionary',
    },
  ],
  action: 'Buy (vendor)',
  locations: [
    {
      name: 'Lehigh',
      // XXX what else goes in here?
    },
    {
      name: 'NYU',
    },
    {
      name: 'CLOCKSS',
    },
  ],
  tracks: [
    {
      name: 'Offsite',
      // XXX what else goes in here?
    },
    {
      name: 'Reserve',
    },
    {
      name: 'Stacks',
    },
  ],
};

function ProjectRoute(props) {
  const setsResource = props.resources.sets;
  const loaded = setsResource && setsResource.hasLoaded;

  return <ProjectView
    loaded={loaded}
    project={dummyProject}
    sets={setsResource.records[0]}
  />;
}

ProjectRoute.manifest = Object.freeze({
  sets: {
    type: 'okapi',
    path: 'cyclops/sets',
  }
});

export default stripesConnect(ProjectRoute);
