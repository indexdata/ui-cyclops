import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { useCallout } from '@folio/stripes/core';
import { Pane, Paneset, Icon, Headline, MenuSection, Button, MultiColumnList, Row, Col, KeyValue, ConfirmationModal, NoValue } from '@folio/stripes/components';
import { useNav } from '../NavContext';
import { RCKV, CKV } from '../components/CKV';
import { listDisplayName, listDisplayTitle, mutateWithCallout } from '../util';
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
  };

  return (
    <>
      <Row>
        <CKV rec={project} tag="name" xs={6} />
        <CKV rec={project} tag="id" xs={3} formatFn={x => <code>{x}</code>} />
        <CKV rec={project} tag="action" xs={3} formatFn={(value) => value.name} />
      </Row>
      <RCKV rec={project} tag="mou_link" formatFn={x => <a target="_blank" rel="noreferrer" href={x}>{x}</a>} />
      <Row>
        <Col xs={6}>
          <KeyValue label={<FormattedMessage id="ui-cyclops.project.field.people" />}>
            (To come)
          </KeyValue>
        </Col>
        <Col xs={6}>
          <KeyValue label={<FormattedMessage id="ui-cyclops.project.field.tracks" />}>
            (To come)
          </KeyValue>
        </Col>
      </Row>
      <Row>
        <CKV
          rec={project}
          tag="funds"
          xs={6}
          formatFn={formatFunds}
        />
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
  filters, populateList, intl) {
  // Each record is { project, set, title }, as returned by the WSAPI. The set
  // name is unqualified, but everything downstream -- URLs, the WSAPI itself --
  // wants the fully qualified `project.set`.
  const contentData = sets.sets;
  const qualifiedName = r => `${r.project}.${r.set}`;

  async function makeNewSet(name, title, filter) {
    setShowCreateModal(false);

    const created = await mutateWithCallout(callout, () => addList(name, title), {
      values: { name },
      successId: 'ui-cyclops.project.new-list.success',
      failureId: 'ui-cyclops.project.new-list.failure',
    });
    if (!created || !filter) return;

    await mutateWithCallout(callout, () => populateList(name, filter), {
      values: { name, filter },
      successId: 'ui-cyclops.project.populate-list.success',
      failureId: 'ui-cyclops.project.populate-list.failure',
    });
  }

  async function actuallyDeleteSet(name) {
    setListToDelete(undefined);

    await mutateWithCallout(callout, () => deleteList(name), {
      values: { name },
      successId: 'ui-cyclops.project.delete-list.success',
      failureId: 'ui-cyclops.project.delete-list.failure',
    });
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
          set: <FormattedMessage id="ui-cyclops.field.name" />,
          title: <FormattedMessage id="ui-cyclops.field.title" />,
          'action-delete': <FormattedMessage id="ui-cyclops.field.action-delete" />,
        }}
        visibleColumns={['set', 'title', 'action-delete']}
        columnWidths={{ 'set': '30%', 'title': '55%' }}
        contentData={contentData}
        formatter={{
          set: r => (
            <Link to={`${packageInfo.stripes.route}/list/${nav.project.id}/${qualifiedName(r)}`}>
              {listDisplayName(qualifiedName(r), intl)}
            </Link>
          ),
          title: r => r.title || <NoValue />,
          'action-delete': r => (
            r.set === 'object' ? null :
            <Button marginBottom0 onClick={() => setListToDelete(r)}>
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
        onConfirm={(name, options) => makeNewSet(`${nav.project.id}.${name}`, options.title, options.filter)}
        onCancel={() => setShowCreateModal(false)}
        message={<FormattedMessage id="ui-cyclops.project.new-list.message" />}
        filters={filters}
        withTitle
      />

      <ConfirmationModal
        heading={<FormattedMessage id="ui-cyclops.project.delete-list.heading" />}
        open={!!listToDelete}
        onConfirm={() => actuallyDeleteSet(qualifiedName(listToDelete))}
        onCancel={() => setListToDelete(undefined)}
        message={<FormattedMessage
          id="ui-cyclops.project.delete-list.message"
          values={{ list: listToDelete && listDisplayTitle(listToDelete.title, qualifiedName(listToDelete), intl) }}
        />}
      />
    </>
  );
}


export default function ProjectView({ loaded, project, sets, filters, addList, populateList, deleteList }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listToDelete, setListToDelete] = useState();
  const callout = useCallout();
  const intl = useIntl();

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
                filters, populateList, intl)}
            </>
          )
        }
      </Pane>
    </Paneset>
  );
}
