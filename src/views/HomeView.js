import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useCallout } from '@folio/stripes/core';
import { Pane, Paneset, Icon, MultiColumnList, Button, ConfirmationModal } from '@folio/stripes/components';
import { useNav } from '../NavContext';
import packageInfo from '../../package';


function renderList(projects, callout, projectToDelete, setProjectToDelete, deleteProject) {
  async function actuallyDeleteProject(project) {
    setProjectToDelete(undefined);
    const name = project.name;

    try {
      await deleteProject(project.id);
      callout.sendCallout({
        message: <FormattedMessage id="ui-cyclops.projects.delete.success" values={{ name }} />,
      });
    } catch (res) {
      callout.sendCallout({
        type: 'error',
        timeout: 0,
        message: <FormattedMessage
          id="ui-cyclops.projects.delete.failure"
          values={{
            name,
            status: res.status,
            statusText: res.statusText,
            body: await res.text(),
          }}
        />
      });
    }
  }

  return (
    <>
      <div />{/* For some reason, if we omit this the MCL does not render */}
      <MultiColumnList
        visibleColumns={['id', 'name', 'action-delete']}
        columnMapping={{
          id: <FormattedMessage id="ui-cyclops.field.id" />,
          name: <FormattedMessage id="ui-cyclops.field.name" />,
          'action-delete': <FormattedMessage id="ui-cyclops.field.action-delete" />,
        }}
        columnWidths={{
          id: '100px',
          name: '300px',
          'action-delete': '200px',
        }}
        contentData={projects.projects}
        formatter={{
          id: r => <Link to={`${packageInfo.stripes.route}/project/${r.id}`}>{r.id}</Link>,
          name: r => <Link to={`${packageInfo.stripes.route}/project/${r.id}`}>{r.name}</Link>,
          'action-delete': r => (
            <Button marginBottom0 onClick={() => setProjectToDelete(r)}>
              <Icon icon="trash" />
              &nbsp;
              <FormattedMessage id="stripes-core.button.delete" />
            </Button>
          ),
        }}
      />

      <ConfirmationModal
        heading={<FormattedMessage id="ui-cyclops.projects.delete.heading" />}
        open={!!projectToDelete}
        onConfirm={() => actuallyDeleteProject(projectToDelete)}
        onCancel={() => setProjectToDelete(undefined)}
        message={<FormattedMessage id="ui-cyclops.projects.delete.message" />}
      />
    </>
  );
}


export default function HomeView({ loaded, projects, deleteProject }) {
  const [projectToDelete, setProjectToDelete] = useState();
  const callout = useCallout();

  const nav = useNav();
  nav.update({ home: { location: useLocation() } });

  return (
    <Paneset static>
      <Pane defaultWidth="20%" paneTitle="">
        {/* Nothing to go here, unless we want an "About" text or something */}
      </Pane>
      <Pane
        defaultWidth="80%"
        paneTitle={<FormattedMessage id="ui-cyclops.projects.count" values={{ count: projects?.projects?.length }} />}
        lastMenu={
          <Button to="project/create">
            <Icon icon="plus-sign" />
            &nbsp;
            <FormattedMessage id="stripes-components.addNew" />
          </Button>
        }
      >
        {loaded
          ? renderList(projects, callout, projectToDelete, setProjectToDelete, deleteProject)
          : <Icon icon="spinner-ellipsis" />
        }
      </Pane>
    </Paneset>
  );
}
