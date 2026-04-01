import React from 'react';
import { Pane } from '@folio/stripes/components';

function SpectreRoute({ match, spectre }) {
  return (
    <Pane>
      <div>
        <pre>{JSON.stringify(match.params, null, 2)}</pre>
      </div>
      <hr />
      <div>
        <pre>{JSON.stringify(spectre, null, 2)}</pre>
      </div>
    </Pane>
  );
}

export default SpectreRoute;
