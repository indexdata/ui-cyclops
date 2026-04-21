import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Pane, Paneset, Icon, MultiColumnList } from '@folio/stripes/components';
import { useNav } from '../NavContext';
import packageInfo from '../../package';


function renderList(projects) {
  return (
    <>
      <div />{/* For some reason, if we omit this the MCL does not render */}
      <MultiColumnList
        columnMapping={{
          id: <FormattedMessage id="ui-cyclops.field.id" />,
          name: <FormattedMessage id="ui-cyclops.field.name" />,
          altName: <FormattedMessage id="ui-cyclops.field.altName" />,
        }}
        contentData={projects.projects}
        formatter={{
          altName: r => <Link to={`${packageInfo.stripes.route}/project/${r.altName}`}>{r.altName}</Link>,
        }}
      />
    </>
  );
}


export default function HomeView({ loaded, projects }) {
  const nav = useNav();
  nav.update({ home: { location: useLocation() } });

  return (
    <Paneset static>
      <Pane defaultWidth="20%" paneTitle="">
        {/* Nothing to go here, unless we want an "About" text or something */}
      </Pane>
      <Pane defaultWidth="80%" paneTitle={<FormattedMessage id="ui-cyclops.projects.count" values={{ count: projects?.projects?.length }} />}>
        {loaded
          ? renderList(projects)
          : <Icon icon="spinner-ellipsis" />
        }
      </Pane>
    </Paneset>
  );
}
