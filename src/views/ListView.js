import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { useCallout } from '@folio/stripes/core';
import { Pane, Paneset, Icon, IconButton, MultiColumnList, Accordion, SearchField, Button, Select, MultiSelection, TextField, MCLPagingTypes, NoValue, Checkbox, MenuSection } from '@folio/stripes/components';
import { useNav } from '../NavContext';
import { PromptModal } from '../components/PromptModal';
import { listDisplayName, mutateWithCallout } from '../util';
import packageInfo from '../../package';

// A valid identifier: a letter or underscore followed by letters, digits or underscores
const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;


const fields = {
  id: ['90px'],
  holdings_count: ['110px'],
  author: ['200px'],
  title: ['450px'],
  full_vendor_name: ['200px'],
  availability: ['240px'],
  decision: ['80px'],
  fund: ['220px'],
};

const searchableIndexes = [{ value: '', label: '-' }].concat(Object.entries(fields).map(([key]) => ({
  value: key,
  label: <FormattedMessage id={`ui-cyclops.field.${key}`} />,
})));


const columnMapping = Object.fromEntries(
  Object.entries(fields).map(([key]) => [key, <FormattedMessage id={`ui-cyclops.field.${key}`} />])
);

const columnWidths = Object.fromEntries(
  Object.entries(fields).map(([key, value]) => [key, value[0]])
);

// The checkbox column for selecting spectres for batch operations. It sits
// to the left of the data columns, is not a real field, and is not sortable.
const visibleColumns = ['select', ...Object.keys(fields)];
const columnMappingWithSelect = { select: <FormattedMessage id="ui-cyclops.field.select" />, ...columnMapping };
const columnWidthsWithSelect = { select: '80px', ...columnWidths };

// Determined experimentally from records in an old "reserve" list
const availabilityValues = [
  'In stock',
  'Temporarily unavailable',
  'Not yet available',
  'No longer supplied by us',
  'Not available (reason unspecified)',
];

const dataOptions = [
  { value: '', label: <FormattedMessage id="ui-cyclops.no-value" /> },
  ...availabilityValues.map(x => ({ value: x, label: <FormattedMessage id={`ui-cyclops.availability.${x}`} /> })),
];

// Comparison directions offered for the numeric holdings-count filter. The
// value is a symbolic token that ListRoute maps to an actual operator when
// building the query condition.
const holdingsCountOps = [
  { value: 'gte', label: <FormattedMessage id="ui-cyclops.holdings-count.gte" /> },
  { value: 'lte', label: <FormattedMessage id="ui-cyclops.holdings-count.lte" /> },
];

// Tri-state filter on whether a decision has been recorded: '' (either),
// 'true' (decision made) or 'false' (no decision made).
const decisionOptions = [
  { value: '', label: <FormattedMessage id="ui-cyclops.no-value" /> },
  { value: 'true', label: <FormattedMessage id="ui-cyclops.decision.made" /> },
  { value: 'false', label: <FormattedMessage id="ui-cyclops.decision.not-made" /> },
];

function renderSearch(query, updateQuery, savedFilters, intl) {
  const onSubmitSearch = (e) => {
    e.preventDefault();
    updateQuery({ query: e.currentTarget.elements.query?.value });
  };

  const filterOptions = savedFilters.map(name => ({ value: name, label: name }));
  const selectedFilters = [].concat(query.filters || []).map(name => ({ value: name, label: name }));

  return (
    <form onSubmit={onSubmitSearch}>
      <SearchField
        autoFocus
        name="query"
        ariaLabel={intl.formatMessage({ id: 'ui-cyclops.search.aria-label' })}
        searchableIndexes={searchableIndexes}
        selectedIndex={query.qindex}
        value={query.query}
        onChangeIndex={(e) => updateQuery({ qindex: e.currentTarget.value })}
        marginBottom0
      />
      <br />
      <Button
        type="submit"
        buttonStyle="primary"
        fullWidth
        marginBottom0
      >
        <FormattedMessage id="stripes-smart-components.search" />
      </Button>
      <br />
      <br />
      <div>
        <Select
          label={<FormattedMessage id="ui-cyclops.field.availability" />}
          dataOptions={dataOptions}
          value={query.availability}
          onChange={(e) => updateQuery({ availability: e.currentTarget.value })}
        />
      </div>
      <div>
        <Select
          label={<FormattedMessage id="ui-cyclops.holdings-count.label" />}
          dataOptions={holdingsCountOps}
          value={query.holdingsCountOp || 'gte'}
          onChange={(e) => updateQuery({ holdingsCountOp: e.currentTarget.value })}
          marginBottom0
        />
        <TextField
          type="number"
          min="0"
          ariaLabel={intl.formatMessage({ id: 'ui-cyclops.holdings-count.value.aria-label' })}
          value={query.holdingsCount ?? ''}
          onChange={(e) => updateQuery({ holdingsCount: e.currentTarget.value })}
        />
      </div>
      <div>
        <Select
          label={<FormattedMessage id="ui-cyclops.decision.label" />}
          dataOptions={decisionOptions}
          value={query.decision}
          onChange={(e) => updateQuery({ decision: e.currentTarget.value })}
        />
      </div>
      <div>
        <MultiSelection
          label={<FormattedMessage id="ui-cyclops.filters.label" />}
          dataOptions={filterOptions}
          value={selectedFilters}
          onChange={(selected) => updateQuery({ filters: selected.map(o => o.value) })}
        />
      </div>
    </form>
  );
}


export default function ListView({ loaded, name, projectId, action, batchUpdate, spectres, spectreCount, query, updateQuery, savedFilters = [], addFrom, addList, populateList, hasSearch, addSpectre, saveSearch, children, pageAmount, onNeedMoreData, pagingOffset }) {
  const [showSearchPane, setShowSearchPane] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      // Return a new set instead of mutating the old, as React state comparison is done by reference
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const intl = useIntl();
  const callout = useCallout();

  const onSaveSearch = async (searchName) => {
    if (!IDENTIFIER_RE.test(searchName)) {
      callout.sendCallout({
        type: 'error',
        message: <FormattedMessage id="ui-cyclops.save-search.invalid" values={{ name: searchName }} />,
      });
      return;
    }

    setShowSaveModal(false);
    await mutateWithCallout(callout, () => saveSearch(searchName), {
      values: { name: searchName },
      successId: 'ui-cyclops.save-search.success',
      failureId: 'ui-cyclops.save-search.failure',
    });
  };

  const makeNewList = async (listName) => {
    setShowCreateModal(false);
    const fullName = `${projectId}.${listName}`;

    const created = await mutateWithCallout(callout, () => addList(fullName), {
      values: { name: fullName },
      successId: 'ui-cyclops.project.new-list.success',
      failureId: 'ui-cyclops.project.new-list.failure',
    });
    if (!created) return;

    await mutateWithCallout(callout, () => populateList(fullName), {
      values: { name: fullName },
      successId: 'ui-cyclops.list.populate-list.success',
      failureId: 'ui-cyclops.list.populate-list.failure',
    });
  };

  const nav = useNav();
  nav.update({ list: { name, location: useLocation() } });
  const totalCount = spectreCount || spectres?.data.length;
  const count = spectreCount || intl.formatMessage({ id: 'ui-cyclops.at-least' }, { minValue: spectres?.data.length });

  const actionName = action?.name || intl.formatMessage({ id: 'ui-cyclops.action.default' });

  const doBatchAction = async () => {
    const ids = [...selectedIds].map(String);
    const done = await mutateWithCallout(callout, () => batchUpdate(ids, { decision: true }), {
      values: { action: actionName, count: ids.length },
      successId: 'ui-cyclops.list.batch.success',
      failureId: 'ui-cyclops.list.batch.failure',
    });
    if (done) setSelectedIds(new Set());
  };

  // The "add spectres" entry is offered only when viewing a list other than
  // the project's master list, and not while already adding from another list.
  const canAddSpectres = name !== projectId + '.object' && !addFrom;

  const renderActionMenu = ({ onToggle }) => (
    <>
      {canAddSpectres &&
        <MenuSection label={intl.formatMessage({ id: 'ui-cyclops.list.actions.workflow' })}>
          <Button
            buttonStyle="dropdownItem"
            to={`${name}?addFrom=${projectId}.object`}
            onClick={onToggle}
          >
            <FormattedMessage id="ui-cyclops.spectres.add" />
          </Button>
        </MenuSection>
      }
      <MenuSection label={intl.formatMessage({ id: 'ui-cyclops.list.actions.selected-spectres' })}>
        <Button
          buttonStyle="dropdownItem"
          disabled={selectedIds.size === 0}
          onClick={() => { onToggle(); doBatchAction(); }}
        >
          {actionName}
        </Button>
      </MenuSection>
    </>
  );

  async function addSpectreToList(addTo, spectreId, title) {
    await mutateWithCallout(callout, () => addSpectre(spectreId), {
      values: { list: addTo, spectreId, title },
      successId: 'ui-cyclops.list.add-spectre.success',
      failureId: 'ui-cyclops.list.add-spectre.failure',
    });
  }

  const renderList = () => {
    const sortedColumn = query.sort?.replace(/^-/, '');
    const sortDirection = query.sort?.startsWith('-') ? 'descending' : 'ascending';

    const fieldNames = spectres.fields.map(({ name: fieldName }) => fieldName);
    const contentData = spectres.data.map(row => (
      Object.fromEntries(fieldNames.map((fieldName, index) => [fieldName, row.values[index]]))
    ));

    const formatter = {
      select: r => (
        <Checkbox
          checked={selectedIds.has(r.id)}
          onChange={() => toggleSelected(r.id)}
          aria-label={intl.formatMessage({ id: selectedIds.has(r.id) ? 'ui-cyclops.deselect.aria-label' : 'ui-cyclops.select.aria-label' }, { title: r.title })}
        />
      ),
      title: r => (
        !addFrom ?
          <Link to={`${packageInfo.stripes.route}/list/${projectId}/${nav.list.name}/${r.id}`}>{r.title}</Link> :
          <>
            <Button marginBottom0 onClick={() => addSpectreToList(name, r.id, r.title)}>
              <Icon icon="plus-sign" />
              &nbsp;
              <FormattedMessage id="ui-cyclops.button.add" />
            </Button>
            &nbsp;
            &nbsp;
            {r.title}
          </>
      ),
      decision: r => (r.decision ? '❎' : <NoValue />),
      fund: r => r.fund?.replace(/.*?:/, ''),
    };

    return (
      <>
        <MultiColumnList
          visibleColumns={visibleColumns}
          columnMapping={columnMappingWithSelect}
          columnWidths={columnWidthsWithSelect}
          nonInteractiveHeaders={['select']}
          formatter={formatter}
          contentData={contentData}
          totalCount={totalCount}
          onHeaderClick={(_, data) => {
            const newSort = (query.sort === data.name) ? `-${data.name}` : data.name;
            updateQuery({ sort: newSort });
          }}
          sortedColumn={sortedColumn}
          sortDirection={sortDirection}
          pagingType={MCLPagingTypes.PREV_NEXT}
          pageAmount={pageAmount}
          onNeedMoreData={onNeedMoreData}
          pagingOffset={pagingOffset}
        />
        <Accordion
          closedByDefault
          label={<FormattedMessage id="ui-cyclops.devInfo" />}
        >
          <pre>{JSON.stringify(spectres, null, 2)}</pre>
        </Accordion>
      </>
    );
  };

  return (
    <Paneset static>
      {showSearchPane &&
        <Pane
          defaultWidth="20%"
          paneTitle="Search & filter"
          lastMenu={<IconButton icon="caret-left" onClick={() => setShowSearchPane(false)} />}
        >
          {renderSearch(query, updateQuery, savedFilters, intl)}
          <br />
          <br />
          <br />
          <Button
            marginBottom0
            onClick={() => setShowSaveModal(true)}
          >
            <FormattedMessage id="ui-cyclops.save-search.button" />
          </Button>
          <br />
          <br />
          <Button
            marginBottom0
            disabled={!hasSearch}
            onClick={() => setShowCreateModal(true)}
          >
            <FormattedMessage id="ui-cyclops.create-list.button" />
          </Button>
        </Pane>
      }
      <Pane
        defaultWidth="fill"
        actionMenu={renderActionMenu}
        paneTitle={
          addFrom ?
            <FormattedMessage id="ui-cyclops.spectres.adding-from" values={{ count, name: listDisplayName(name, intl), addFrom: listDisplayName(addFrom, intl) }} /> :
            <FormattedMessage id="ui-cyclops.spectres.count" values={{ count, name: listDisplayName(name, intl) }} />
        }
        firstMenu={
          showSearchPane ? undefined : (
            <IconButton icon="caret-right" onClick={() => setShowSearchPane(true)} />
          )
        }
      >
        {loaded
          ? renderList()
          : <Icon icon="spinner-ellipsis" />
        }
      </Pane>
      {children}

      <PromptModal
        heading={<FormattedMessage id="ui-cyclops.save-search.heading" />}
        open={showSaveModal}
        onConfirm={onSaveSearch}
        onCancel={() => setShowSaveModal(false)}
        message={<FormattedMessage id="ui-cyclops.save-search.message" />}
      />

      <PromptModal
        heading={<FormattedMessage id="ui-cyclops.project.new-list.heading" />}
        open={showCreateModal}
        onConfirm={makeNewList}
        onCancel={() => setShowCreateModal(false)}
        message={<FormattedMessage id="ui-cyclops.project.new-list.message" />}
      />
    </Paneset>
  );
}
