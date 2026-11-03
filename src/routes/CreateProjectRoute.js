import React from 'react';
import { useHistory } from 'react-router-dom';
import { stripesConnect, useCallout } from '@folio/stripes/core';
import ProjectForm from '../forms/ProjectForm';
import { mutateWithCallout } from '../util';

function CreateProjectRoute({ resources, mutator }) {
  const history = useHistory();
  const callout = useCallout();

  const handleClose = () => {
    history.push('..');
  };

  const handleSubmit = async (record) => {
    // The controlled vocabularies only edit fund and track IDs; the server
    // does not need (and we do not retain) the human-readable `name` of each.
    const normalized = {
      ...record,
      funds: (record.funds || []).map(({ id }) => ({ id })),
      tracks: (record.tracks || []).map(({ id }) => ({ id })),
    };

    // The created project's id comes back on the response, and is what the
    // redirect uses; the callouts name the id as submitted, which the form
    // requires and the server honours.
    let created;
    const ok = await mutateWithCallout(callout, async () => {
      created = await mutator.project.POST(normalized);
    }, {
      values: { name: record.id },
      successId: 'ui-cyclops.project.create.success',
      failureId: 'ui-cyclops.project.create.failure',
    });
    if (ok) history.push(`./${created.id}`);
  };

  const fundsResource = resources.funds;
  const tracksResource = resources.tracks;
  const loaded = (fundsResource && fundsResource.hasLoaded &&
                  tracksResource && tracksResource.hasLoaded);
  const funds = (fundsResource.records[0] || {}).funds || [];
  const tracks = (tracksResource.records[0] || {}).tracks || [];

  return <ProjectForm
    loaded={loaded}
    initialValues={{}}
    funds={funds}
    tracks={tracks}
    onSubmit={handleSubmit}
    onClose={handleClose}
  />;
}

CreateProjectRoute.manifest = Object.freeze({
  project: {
    type: 'okapi',
    path: 'cyclops/projects',
    fetch: false,
    POST: {
      throwErrors: false,
    },
  },
  funds: {
    type: 'okapi',
    path: 'cyclops/funds',
  },
  tracks: {
    type: 'okapi',
    path: 'cyclops/tracks',
  },
});

export default stripesConnect(CreateProjectRoute);
