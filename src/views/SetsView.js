import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Pane, Paneset, Icon, MultiColumnList } from '@folio/stripes/components';


function renderList(sets) {
  const contentData = sets.sets.map(name => ({ name }));

  return (
    <>
      <div />{/* For some reason, if we omit this the MCL does not render */}
      <MultiColumnList
        contentData={contentData}
        formatter={{
          name: r => <Link to={`./cyclops/set/${r.name}`}>{r.name}</Link>
        }}
      />
    </>
  );
}


export default function SetsView({ loaded, sets }) {
  return (
    <Paneset static>
      <Pane defaultWidth="20%" paneTitle="">
        {/* Nothing to go here, unless we want an "About" text or something */}
      </Pane>
      <Pane defaultWidth="80%" paneTitle={<FormattedMessage id="ui-cyclops.sets.count" values={{ count: sets?.sets.length }} />}>
        {loaded
          ? renderList(sets)
          : <Icon icon="spinner-ellipsis" />
        }
      </Pane>
    </Paneset>
  );
}
