import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useCallout } from '@folio/stripes/core';
import { Pane, Paneset, Icon, IconButton, MultiColumnList, Accordion, SearchField, Button, Select } from '@folio/stripes/components';
import { useNav } from '../NavContext';
import packageInfo from '../../package';


const fields = {
  id: ['100px'],
  author: ['200px'],
  title: ['450px'],
  full_vendor_name: ['200px'],
  availability: ['140px'],
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

// Determined experimentally from records in "reserve"
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

function renderSearch(query, updateQuery) {
  const onSubmitSearch = (e) => {
    e.preventDefault();
    updateQuery({ query: e.currentTarget.elements.query?.value });
  };

  return (
    <form onSubmit={onSubmitSearch}>
      <SearchField
        autoFocus
        name="query"
        ariaLabel="XXX search"
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
    </form>
  );
}


function renderList(spectres, nav, query, updateQuery, addFrom, name, callout, addSpectre) {
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

  const contentData = spectres.data.map(row => ({
    id: row.values[0],
    author: row.values[1],
    title: row.values[2],
    full_vendor_name: row.values[3],
    availability: row.values[4],
  }));

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
  };

  return (
    <>
      <MultiColumnList
        visibleColumns={Object.keys(fields)}
        columnMapping={columnMapping}
        columnWidths={columnWidths}
        formatter={formatter}
        contentData={contentData}
        onHeaderClick={(_, data) => {
          const newSort = (query.sort === data.name) ? `-${data.name}` : data.name;
          updateQuery({ sort: newSort });
        }}
        sortedColumn={sortedColumn}
        sortDirection={sortDirection}
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


export default function ListView({ loaded, name, spectres, query, updateQuery, addFrom, addSpectre, children }) {
  const [showSearchPane, setShowSearchPane] = useState(true);
  const callout = useCallout();

  const nav = useNav();
  nav.update({ list: { name, location: useLocation() } });

  return (
    <Paneset static>
      {showSearchPane &&
        <Pane
          defaultWidth="20%"
          paneTitle="Search & filter"
          lastMenu={<IconButton icon="caret-left" onClick={() => setShowSearchPane(false)} />}
        >
          {renderSearch(query, updateQuery)}
        </Pane>
      }
      <Pane
        defaultWidth="fill"
        paneTitle={
          addFrom ?
            <FormattedMessage id="ui-cyclops.spectres.adding-from" values={{ count: spectres?.data.length, name, addFrom }} /> :
            <FormattedMessage id="ui-cyclops.spectres.count" values={{ count: spectres?.data.length, name }} />
        }
        firstMenu={
          showSearchPane ? undefined : (
            <IconButton icon="caret-right" onClick={() => setShowSearchPane(true)} />
          )
        }
        lastMenu={
          name === 'reserve' || !!addFrom ? undefined :
          <Button marginBottom0 to={`${name}?addFrom=reserve`}>
            <Icon icon="plus-sign" />
            &nbsp;
            <FormattedMessage id="ui-cyclops.spectres.add" />
          </Button>
        }
      >
        {loaded
          ? renderList(spectres, nav, query, updateQuery, addFrom, name, callout, addSpectre)
          : <Icon icon="spinner-ellipsis" />
        }
      </Pane>
      {children}
    </Paneset>
  );
}
