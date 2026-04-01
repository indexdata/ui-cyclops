import React from 'react';
import { Pane } from '@folio/stripes/components';

function SpectreRoute({ match }) {
  return <Pane><code>{JSON.stringify(match.params, null, 2)}</code></Pane>;
}

export default SpectreRoute;
