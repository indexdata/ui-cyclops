import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useCallout } from '@folio/stripes/core';
import { Pane, Paneset, Icon, Headline, MenuSection, Button, MultiColumnList, Row, Col, KeyValue, ConfirmationModal, NoValue } from '@folio/stripes/components';
import { useNav } from '../NavContext';
import { RCKV, CKV } from '../components/CKV';
import packageInfo from '../../package';
import css from './ProjectView.css';
import { PromptModal } from '../components/PromptModal';


function formatFunds(entries) {
  if (entries.length === 0) return <NoValue />;

  return (
    <ul>
      {entries.map(entry => (
        <li key={entry.id}>
          <code>{entry.id}</code> ({entry.name})
        </li>
      ))}
    </ul>
  );
}


function renderProject(baseProject) {
  const project = {
    ...baseProject,

    // Dummy data until we can get the real stuff from CCMS
    people: [
      {
        name: 'Boaz (Lehigh)',
        role: 'Admin',
      },
      {
        name: 'Sebastian (Index Data)',
        role: 'Visionary',
      },
    ],
    tracks: [
      {
        name: 'Offsite',
      },
      {
        name: 'Reserve',
      },
      {
        name: 'Stacks',
      },
    ],
  };

  return (
    <>
      <Row>
        <CKV rec={project} tag="name" xs={6} />
        <CKV rec={project} tag="id" xs={3} formatFn={x => <code>{x}</code>} />
        <CKV rec={project} tag="action" xs={3} formatFn={(value) => value.name} />
      </Row>
      <RCKV rec={project} tag="mou_link" formatFn={x => <a target="_blank" rel="noreferrer" href={x}>{x}</a>} />
      <RCKV
        xs={6}
        rec={project}
        tag="people"
        formatFn={
          x => (
            <ul>
              {x.map(y => <li key={y.name}>{y.name}: {y.role}</li>)}
            </ul>
          )
        }
      />
      <Row>
        <CKV
          rec={project}
          tag="funds"
          xs={6}
          formatFn={formatFunds}
        />
        <Col xs={6}>
          <KeyValue label={<FormattedMessage id="ui-cyclops.project.field.tracks" />}>
            <ul>
              {project.tracks.map(x => <li key={x.name}>{x.name}</li>)}
            </ul>
          </KeyValue>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <KeyValue label={<FormattedMessage id="ui-cyclops.project.field.origins" />}>
            <ul>
              {project.origins.map(x => <li key={x.name}>{x.name}</li>)}
            </ul>
          </KeyValue>
        </Col>
        <Col xs={6}>
          <KeyValue label={<FormattedMessage id="ui-cyclops.project.field.destinations" />}>
            <ul>
              {project.destinations.map(x => <li key={x.name}>{x.name}</li>)}
            </ul>
          </KeyValue>
        </Col>
      </Row>
    </>
  );
}


function renderList(sets, nav, callout,
  showCreateModal, setShowCreateModal, addList,
  listToDelete, setListToDelete, deleteList,
  filters, populateList) {
  const contentData = sets.sets.map(name => ({ name }));

  async function makeNewSet(name, filter) {
    setShowCreateModal(false);

    try {
      await addList(name);
      callout.sendCallout({
        message: <FormattedMessage id="ui-cyclops.project.new-list.success" values={{ name }} />,
      });
    } catch (res) {
      callout.sendCallout({
        type: 'error',
        timeout: 0,
        message: <FormattedMessage
          id="ui-cyclops.project.new-list.failure"
          values={{
            name,
            status: res.status,
            statusText: res.statusText,
            body: await res.text(),
          }}
        />
      });
      return;
    }

    if (!filter) return;

    try {
      await populateList(name, filter);
      callout.sendCallout({
        message: <FormattedMessage id="ui-cyclops.project.populate-list.success" values={{ name, filter }} />,
      });
    } catch (res) {
      callout.sendCallout({
        type: 'error',
        timeout: 0,
        message: <FormattedMessage
          id="ui-cyclops.project.populate-list.failure"
          values={{
            name,
            filter,
            status: res.status,
            statusText: res.statusText,
            body: await res.text(),
          }}
        />
      });
    }
  }

  async function actuallyDeleteSet(name) {
    setListToDelete(undefined);

    try {
      await deleteList(name);
      callout.sendCallout({
        message: <FormattedMessage id="ui-cyclops.project.delete-list.success" values={{ name }} />,
      });
    } catch (res) {
      callout.sendCallout({
        type: 'error',
        timeout: 0,
        message: <FormattedMessage
          id="ui-cyclops.project.delete-list.failure"
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

  /* eslint-disable jsx-a11y/anchor-is-valid */
  return (
    <>
      <hr />
      <div className={css.flex}>
        <Headline tag="h3" size="large" margin="small">
          <FormattedMessage id="ui-cyclops.project.lists" />
        </Headline>
        <Button
          onClick={() => setShowCreateModal(true)}
        >
          <Icon icon="plus-sign" />
          &nbsp;
          <FormattedMessage id="stripes-components.addNew" />
        </Button>
      </div>

      <MultiColumnList
        columnMapping={{
          name: <FormattedMessage id="ui-cyclops.field.name" />,
          'action-delete': <FormattedMessage id="ui-cyclops.field.action-delete" />,
        }}
        visibleColumns={['name', 'action-delete']}
        columnWidths={{ 'name': '85%x' }}
        contentData={contentData}
        formatter={{
          name: r => (
            <Link to={`${packageInfo.stripes.route}/list/${nav.project.id}/${r.name}`}>
              {r.name?.replace(/.*\./, '')}
            </Link>
          ),
          'action-delete': r => (
            r.name === nav.project.id + '.object' ? null :
            <Button marginBottom0 onClick={() => setListToDelete(r.name)}>
              <Icon icon="trash" />
              &nbsp;
              <FormattedMessage id="stripes-core.button.delete" />
            </Button>
          ),
        }}
      />

      <PromptModal
        heading={<FormattedMessage id="ui-cyclops.project.new-list.heading" />}
        open={showCreateModal}
        onConfirm={(name, filter) => makeNewSet(`${nav.project.id}.${name}`, filter)}
        onCancel={() => setShowCreateModal(false)}
        message={<FormattedMessage id="ui-cyclops.project.new-list.message" />}
        filters={filters}
      />

      <ConfirmationModal
        heading={<FormattedMessage id="ui-cyclops.project.delete-list.heading" />}
        open={!!listToDelete}
        onConfirm={() => actuallyDeleteSet(listToDelete)}
        onCancel={() => setListToDelete(undefined)}
        message={<FormattedMessage id="ui-cyclops.project.delete-list.message" />}
      />
    </>
  );
}


export default function ProjectView({ loaded, project, sets, filters, addList, populateList, deleteList }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listToDelete, setListToDelete] = useState();
  const callout = useCallout();

  const nav = useNav();
  nav.update({ project: { ...project, location: useLocation() } });

  const paneTitle = <FormattedMessage
    id="ui-cyclops.project.header"
    values={{
      count: sets?.sets.length,
      project: nav.project.name,
    }}
  />;

  const renderActionMenu = () => (
    <MenuSection label="Actions">
      <Button buttonStyle="dropdownItem" to={`${nav.project.id}/edit`}>
        <Icon size="small" icon="edit">
          Edit
        </Icon>
      </Button>
    </MenuSection>
  );

  return (
    <Paneset static>
      <Pane defaultWidth="20%" paneTitle="">
        {/* Nothing to go here, unless we want an "About" text or something */}
      </Pane>
      <Pane defaultWidth="80%" paneTitle={paneTitle} actionMenu={renderActionMenu}>
        {!loaded
          ? <Icon icon="spinner-ellipsis" />
          : (
            <>
              {renderProject(project)}
              {renderList(sets, nav, callout,
                showCreateModal, setShowCreateModal, addList,
                listToDelete, setListToDelete, deleteList,
                filters, populateList)}
            </>
          )
        }
      </Pane>
    </Paneset>
  );
}
