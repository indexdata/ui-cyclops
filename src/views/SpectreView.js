import React from 'react';
import { Pane, LoadingPane } from '@folio/stripes/components';

function SpectreRoute({ loaded, match, spectre }) {
  if (!loaded) return <LoadingPane />;

  return (
    <Pane>
      <div>
        <pre>{JSON.stringify(spectre, null, 2)}</pre>
      </div>
    </Pane>
  );
}

export default SpectreRoute;
