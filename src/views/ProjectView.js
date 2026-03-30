import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Pane, Paneset, Icon, MultiColumnList } from '@folio/stripes/components';
import { useNav } from '../NavContext';
import packageInfo from '../../package';


function renderList(sets, nav, rrhistory) {
  const contentData = sets.sets.map(name => ({ name }));

  /* eslint-disable jsx-a11y/anchor-is-valid */
  return (
    <>
      <div />{/* For some reason, if we omit this the MCL does not render */}
      <MultiColumnList
        columnMapping={{
          name: <FormattedMessage id={`ui-cyclops.field.name`} />,
        }}
        contentData={contentData}
        formatter={{
          name: r => (
            <Link
              onClick={(e) => {
                e.preventDefault();
                nav.list = r;
                rrhistory.push(`${packageInfo.stripes.route}/list/${nav.project.id}/${r.name}`);
              }}
            >
              {r.name}
            </Link>
          ),
        }}
      />
    </>
  );
}


export default function ProjectView({ loaded, sets }) {
  const nav = useNav();
  const rrhistory = useHistory();

  const paneTitle = <FormattedMessage
    id="ui-cyclops.sets.count"
    values={{
      count: sets?.sets.length,
      project: nav.project.name,
    }}
  />;

  return (
    <Paneset static>
      <Pane defaultWidth="20%" paneTitle="">
        {/* Nothing to go here, unless we want an "About" text or something */}
      </Pane>
      <Pane defaultWidth="80%" paneTitle={paneTitle}>
        {loaded
          ? renderList(sets, nav, rrhistory)
          : <Icon icon="spinner-ellipsis" />
        }
      </Pane>
    </Paneset>
  );
}
