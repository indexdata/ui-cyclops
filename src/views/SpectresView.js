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

  const fields = {
    id: ['100px'],
    author: ['200px'],
    title: ['350px'],
    full_vendor_name: ['200px'],
    availability: ['140px'],
  };

  const columnMapping = Object.fromEntries(
    Object.entries(fields).map(([key]) => [key, <FormattedMessage id={`ui-cyclops.field.${key}`} />])
  );

  const columnWidths = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, value[0]])
  );

  return (
    <>
      <div />{/* For some reason, if we omit this the MCL does not render */}
      <MultiColumnList
        visibleColumns={Object.keys(fields)}
        columnMapping={columnMapping}
        columnWidths={columnWidths}
        contentData={contentData}
      />
      <pre>{JSON.stringify(spectres, null, 2)}</pre>
    </>
  );
}


export default function SpectresView({ loaded, name, spectres }) {
  return (
    <Paneset static>
      <Pane defaultWidth="20%" paneTitle="Search & filter">
        <Headline size="small">XXX to be done</Headline>
      </Pane>
      <Pane defaultWidth="80%" paneTitle={<FormattedMessage id="ui-cyclops.spectres.count" values={{ count: spectres?.data.length, name }} />}>
        {loaded
          ? renderList(spectres)
          : <Icon icon="spinner-ellipsis" />
        }
      </Pane>
    </Paneset>
  );
}
