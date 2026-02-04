import React from 'react';
import { Link } from 'react-router-dom';
import { Pane, Paneset, Headline, Icon, MultiColumnList } from '@folio/stripes/components';


function renderList(sets) {
  const contentData = sets.sets.concat('mike', 'fiona').map(name => ({ name }));

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
      <Pane defaultWidth="80%" paneTitle="Sets">
        <Headline size="small" margin="medium">
          {loaded && <>{sets.sets.length} sets</>}
        </Headline>
        {loaded
          ? renderList(sets)
          : <Icon icon="spinner-ellipsis" />
        }
      </Pane>
    </Paneset>
  );
}
