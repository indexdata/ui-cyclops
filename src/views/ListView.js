import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { useCallout } from '@folio/stripes/core';
import { Pane, Paneset, Icon, IconButton, MultiColumnList, Accordion, SearchField, Button, Select, MultiSelection, TextField, MCLPagingTypes, NoValue, Checkbox, MenuSection } from '@folio/stripes/components';
import { useNav } from '../NavContext';
import { PromptModal } from '../components/PromptModal';
import { listDisplayName, mutateWithCallout } from '../util';
import packageInfo from '../../package';
import css from './ListView.css';

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

// There is no empty entry among the searchable indexes, so a search with none
// explicitly chosen runs against this one. ListRoute uses it too, when building
// the query condition.
export const DEFAULT_QINDEX = 'title';

const searchableIndexes = [].concat(Object.entries(fields).map(([key]) => ({
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

// Every part of the search that "Reset all" clears, with the values that
// represent "nothing chosen".
const emptySearch = {
  qindex: DEFAULT_QINDEX,
  query: '',
  availability: '',
  holdingsCountOp: 'gte',
  holdingsCount: '',
  decision: '',
  filters: [],
};

// True when any part of the search differs from its empty/default value, i.e.
// when there is something for "Reset all" to clear. The search term is passed
// separately, as what counts is what is in the box rather than what was last
// submitted.
function isDirty(query, searchTerm) {
  if (searchTerm !== '') return true;

  return Object.entries(emptySearch).some(([key, empty]) => {
    if (key === 'query') return false; // handled above, via searchTerm
    const value = query[key];
    if (key === 'filters') return [].concat(value || []).length > 0;
    // An absent value means the control is showing its default, which is the
    // empty value -- notably for holdingsCountOp, whose default is not ''
    return (value ?? empty) !== empty;
  });
}

// The search term is held in the caller's state rather than in the query
// resource, so that typing is reflected in the UI (enabling "Reset all")
// without re-running the search on every keystroke: only submitting does that.
function renderSearch(query, updateQuery, savedFilters, intl, searchTerm, setSearchTerm, onResetAll) {
  const onSubmitSearch = (e) => {
    e.preventDefault();
    updateQuery({ query: searchTerm });
  };

  // Filters are qualified as `project.filter` only when created: within a
  // project, both the UI and the conditions we send to the WSAPI use the
  // unqualified name.
  const filterOptions = savedFilters.map(f => ({ value: f.filter, label: f.filter }));
  const selectedFilters = [].concat(query.filters || []).map(name => ({ value: name, label: name }));
  const dirty = isDirty(query, searchTerm);

  return (
    <form onSubmit={onSubmitSearch}>
      <div className={css.searchGroupWrap}>
        <SearchField
          autoFocus
          name="query"
          className={css.searchField}
          ariaLabel={intl.formatMessage({ id: 'ui-cyclops.search.aria-label' })}
          searchableIndexes={searchableIndexes}
          selectedIndex={query.qindex || DEFAULT_QINDEX}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          onChangeIndex={(e) => updateQuery({ qindex: e.currentTarget.value })}
          marginBottom0
        />
        <Button
          type="submit"
          buttonStyle="primary"
          fullWidth
          marginBottom0
          disabled={!dirty}
        >
          <FormattedMessage id="stripes-smart-components.search" />
        </Button>
      </div>
      <Button
        type="button"
        fullWidth
        disabled={!dirty}
        onClick={onResetAll}
      >
        <Icon icon="times-circle-solid">
          <FormattedMessage id="ui-cyclops.reset-all.button" />
        </Icon>
      </Button>
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
  const [searchTerm, setSearchTerm] = useState(query.query || '');

  const resetAll = () => {
    updateQuery(emptySearch);
    setSearchTerm('');
  };

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
    // Filters are namespaced to their project on creation
    await mutateWithCallout(callout, () => saveSearch(`${projectId}.${searchName}`), {
      values: { name: searchName },
      successId: 'ui-cyclops.save-search.success',
      failureId: 'ui-cyclops.save-search.failure',
    });
  };

  const makeNewList = async (listName, options) => {
    setShowCreateModal(false);
    const fullName = `${projectId}.${listName}`;

    const created = await mutateWithCallout(callout, () => addList(fullName, options?.title), {
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
          {renderSearch(query, updateQuery, savedFilters, intl, searchTerm, setSearchTerm, resetAll)}
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
        withTitle
      />
    </Paneset>
  );
}
