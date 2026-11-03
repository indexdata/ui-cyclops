import React from 'react';
import { useHistory } from 'react-router-dom';
import { stripesConnect, useCallout } from '@folio/stripes/core';
import ProjectForm from '../forms/ProjectForm';
import { mutateWithCallout } from '../util';

function EditProjectRoute({ resources, mutator, match }) {
  const history = useHistory();
  const callout = useCallout();

  const handleClose = () => {
    history.push(`../${match.params.projectId}`);
  };

  const handleSubmit = async (record) => {
    const updated = await mutateWithCallout(callout, () => mutator.project.PUT(record), {
      values: { name: record.id },
      successId: 'ui-cyclops.project.update.success',
      failureId: 'ui-cyclops.project.update.failure',
    });
    if (updated) handleClose();
  };

  const projectResource = resources.project;
  const fundsResource = resources.funds;
  const tracksResource = resources.tracks;
  const loaded = (projectResource && projectResource.hasLoaded &&
                  fundsResource && fundsResource.hasLoaded &&
                  tracksResource && tracksResource.hasLoaded);
  const funds = (fundsResource.records[0] || {}).funds || [];
  const tracks = (tracksResource.records[0] || {}).tracks || [];
  const project = projectResource.records[0];

  return <ProjectForm
    loaded={loaded}
    initialValues={project}
    funds={funds}
    tracks={tracks}
    onSubmit={handleSubmit}
    onClose={handleClose}
  />;
}

EditProjectRoute.manifest = Object.freeze({
  project: {
    type: 'okapi',
    path: 'cyclops/projects/:{projectId}',
    PUT: {
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

export default stripesConnect(EditProjectRoute);
