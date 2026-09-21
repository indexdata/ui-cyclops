import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { stripesConnect, useCallout } from '@folio/stripes/core';
import ProjectForm from '../forms/ProjectForm';

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

    try {
      const newRecord = await mutator.project.POST(normalized);
      callout.sendCallout({
        message: <FormattedMessage id="ui-cyclops.project.create.success" values={{ name: newRecord.id }} />,
      });
      history.push(`./${newRecord.id}`);
    } catch (res) {
      callout.sendCallout({
        type: 'error',
        timeout: 0,
        message: <FormattedMessage
          id="ui-cyclops.project.create.failure"
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
