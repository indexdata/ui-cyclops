import React from 'react';
import { Pane, Paneset,  Headline, Icon } from '@folio/stripes/components';



function renderList(spectres) {
  return <pre>{JSON.stringify(spectres, null, 2)}</pre>
}


export default function SpectresView({ loaded, spectres }) {
  return (
    <Paneset static>
      <Pane defaultWidth="20%" paneTitle="About/Filters">
        <Headline size="small">XXX to be done</Headline>
      </Pane>
      <Pane defaultWidth="80%" paneTitle="Objects">
        <Headline size="small" margin="medium">
          {loaded && <>{spectres.data.length} objects</>}
        </Headline>
        {loaded
          ? renderList(spectres)
          : <Icon icon="spinner-ellipsis" />
        }
      </Pane>
    </Paneset>
  );
};
