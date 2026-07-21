import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { useCallout } from '@folio/stripes/core';
import { Pane, Paneset, Icon, IconButton, MultiColumnList, Accordion, SearchField, Button, Select, MultiSelection, TextField, MCLPagingTypes, NoValue } from '@folio/stripes/components';
import { useNav } from '../NavContext';
import { PromptModal } from '../components/PromptModal';
import packageInfo from '../../package';

// A valid identifier: a letter or underscore followed by letters, digits or underscores
const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;


const fields = {
  id: ['80px'],
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


function renderList(spectres, nav, query, updateQuery, addFrom, name, callout, addSpectre, pageAmount, onNeedMoreData, totalCount, pagingOffset) {
  const sortedColumn = query.sort?.replace(/^-/, '');
  const sortDirection = query.sort?.startsWith('-') ? 'descending' : 'ascending';

  async function addSpectreToList(addTo, spectreId, title) {
    try {
      await addSpectre(spectreId);
      callout.sendCallout({
        message: <FormattedMessage id="ui-cyclops.list.add-spectre.success" values={{ list: addTo, spectreId, title }} />,
      });
    } catch (res) {
      callout.sendCallout({
        type: 'error',
        timeout: 0,
        message: <FormattedMessage
          id="ui-cyclops.list.add-spectre.failure"
          values={{
            list: addTo,
            spectreId,
            title,
            status: res.status,
            statusText: res.statusText,
            body: await res.text(),
          }}
        />
      });
    }
  }

  const fieldNames = spectres.fields.map(({ name: fieldName }) => fieldName);
  const contentData = spectres.data.map(row => (
    Object.fromEntries(fieldNames.map((fieldName, index) => [fieldName, row.values[index]]))
  ));

  const formatter = {
    title: r => (
      !addFrom ?
        <Link to={`${packageInfo.stripes.route}/list/${nav.project.id}/${nav.list.name}/${r.id}`}>{r.title}</Link> :
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
        visibleColumns={Object.keys(fields)}
        columnMapping={columnMapping}
        columnWidths={columnWidths}
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
}


export default function ListView({ loaded, name, spectres, spectreCount, query, updateQuery, savedFilters = [], addFrom, addSpectre, saveSearch, children, pageAmount, onNeedMoreData, pagingOffset }) {
  const [showSearchPane, setShowSearchPane] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
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
    try {
      await saveSearch(searchName);
      callout.sendCallout({
        message: <FormattedMessage id="ui-cyclops.save-search.success" values={{ name: searchName }} />,
      });
    } catch (res) {
      callout.sendCallout({
        type: 'error',
        timeout: 0,
        message: <FormattedMessage
          id="ui-cyclops.save-search.failure"
          values={{
            name: searchName,
            status: res.status,
            statusText: res.statusText,
            body: await res.text(),
          }}
        />
      });
    }
  };

  const nav = useNav();
  nav.update({ list: { name, location: useLocation() } });
  const totalCount = spectreCount || spectres?.data.length;
  const count = spectreCount || intl.formatMessage({ id: 'ui-cyclops.at-least' }, { minValue: spectres?.data.length });

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
          <Button
            marginBottom0
            onClick={() => setShowSaveModal(true)}
          >
            <FormattedMessage id="ui-cyclops.save-search.button" />
          </Button>
        </Pane>
      }
      <Pane
        defaultWidth="fill"
        paneTitle={
          addFrom ?
            <FormattedMessage id="ui-cyclops.spectres.adding-from" values={{ count, name: name?.replace(/.*\./, ''), addFrom }} /> :
            <FormattedMessage id="ui-cyclops.spectres.count" values={{ count, name: name?.replace(/.*\./, '') }} />
        }
        firstMenu={
          showSearchPane ? undefined : (
            <IconButton icon="caret-right" onClick={() => setShowSearchPane(true)} />
          )
        }
        lastMenu={
          name === nav.project.id + '.object' || !!addFrom ? undefined :
          <Button marginBottom0 to={`${name}?addFrom=${nav.project.id}.object`}>
            <Icon icon="plus-sign" />
            &nbsp;
            <FormattedMessage id="ui-cyclops.spectres.add" />
          </Button>
        }
      >
        {loaded
          ? renderList(spectres, nav, query, updateQuery, addFrom, name, callout, addSpectre, pageAmount, onNeedMoreData, totalCount, pagingOffset)
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
    </Paneset>
  );
}
