import React from 'react';
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
      <Pane defaultWidth="80%" paneTitle={<>Spectres in set <code>foobar</code></>}>
        <Headline size="small" margin="medium">
          {loaded && <>{spectres.data.length} spectres</>}
        </Headline>
        {loaded
          ? renderList(spectres)
          : <Icon icon="spinner-ellipsis" />
        }
      </Pane>
    </Paneset>
  );
}
