import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { stripesConnect, useCallout } from '@folio/stripes/core';
import ProjectForm from '../forms/ProjectForm';

function EditProjectRoute({ resources, mutator, match }) {
  const history = useHistory();
  const callout = useCallout();

  const handleClose = () => {
    history.push(`../${match.params.projectId}`);
  };

  const handleSubmit = async (record) => {
    try {
      await mutator.project.PUT(record);
      callout.sendCallout({
        message: <FormattedMessage id="ui-cyclops.project.update.success" values={{ name: record.id }} />,
      });
      handleClose();
    } catch (res) {
      callout.sendCallout({
        type: 'error',
        timeout: 0,
        message: <FormattedMessage
          id="ui-cyclops.project.update.failure"
          values={{
            name: record.id,
            status: res.status,
            statusText: res.statusText,
            body: await res.text(),
          }}
        />
      });
    }
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
