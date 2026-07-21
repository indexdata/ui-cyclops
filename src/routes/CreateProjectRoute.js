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
    // The controlled vocabulary only edits fund IDs; the server does not need
    // (and we do not retain) the human-readable `name` of each fund.
    const normalized = {
      ...record,
      funds: (record.funds || []).map(({ id }) => ({ id })),
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
  const loaded = fundsResource && fundsResource.hasLoaded;
  const funds = (fundsResource.records[0] || {}).funds || [];

  return <ProjectForm
    loaded={loaded}
    initialValues={{}}
    funds={funds}
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
});

export default stripesConnect(CreateProjectRoute);
