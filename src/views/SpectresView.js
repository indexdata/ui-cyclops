import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Pane, Paneset, Headline, Icon, MultiColumnList } from '@folio/stripes/components';


function renderList(spectres) {
  const contentData = spectres.data.map(row => ({
    id: row.values[0],
    author: row.values[1],
    title: row.values[2],
    full_vendor_name: row.values[3],
    availability: row.values[4],
  }));

  return (
    <>
      <div />{/* For some reason, if we omit this the MCL does not render */}
      <MultiColumnList
        contentData={contentData}
        columnWidths={{
          id: '100px',
          author: '200px',
          title: '350px',
          full_vendor_name: '200px',
          availability: '140px',
        }}
      />
      <pre>{JSON.stringify(spectres, null, 2)}</pre>
    </>
  );
}


export default function SpectresView({ loaded, spectres }) {
  return (
    <Paneset static>
      <Pane defaultWidth="20%" paneTitle="Search & filter">
        <Headline size="small">XXX to be done</Headline>
      </Pane>
      <Pane defaultWidth="80%" paneTitle={<FormattedMessage id="ui-cyclops.spectres.count" values={{ count: spectres?.data.length, name: 'foobar' }} />}>
        {loaded
          ? renderList(spectres)
          : <Icon icon="spinner-ellipsis" />
        }
      </Pane>
    </Paneset>
  );
}
