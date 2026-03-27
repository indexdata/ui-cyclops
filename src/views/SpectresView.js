import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Pane, Paneset, Icon, IconButton, MultiColumnList, Accordion, SearchField, Button } from '@folio/stripes/components';


const fields = {
  id: ['100px'],
  author: ['200px'],
  title: ['350px'],
  full_vendor_name: ['200px'],
  availability: ['140px'],
};

const searchableIndexes = Object.entries(fields).map(([key]) => ({
  value: key,
  label: <FormattedMessage id={`ui-cyclops.field.${key}`} />,
}));

const columnMapping = Object.fromEntries(
  Object.entries(fields).map(([key]) => [key, <FormattedMessage id={`ui-cyclops.field.${key}`} />])
);

const columnWidths = Object.fromEntries(
  Object.entries(fields).map(([key, value]) => [key, value[0]])
);


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
        onChangeIndex={(e) => updateQuery({ qindex: e.target.value })}
        marginBottom0
      />
      <Button
        type="submit"
        buttonStyle="primary"
        fullWidth
        marginBottom0
      >
        <FormattedMessage id="stripes-smart-components.search" />
      </Button>
    </form>
  );
}


function renderList(spectres, query, updateQuery) {
  const sortedColumn = query.sort?.replace(/^-/, '');
  const sortDirection = query.sort?.startsWith('-') ? 'descending' : 'ascending';

  const contentData = spectres.data.map(row => ({
    id: row.values[0],
    author: row.values[1],
    title: row.values[2],
    full_vendor_name: row.values[3],
    availability: row.values[4],
  }));

  return (
    <>
      <MultiColumnList
        visibleColumns={Object.keys(fields)}
        columnMapping={columnMapping}
        columnWidths={columnWidths}
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


export default function SpectresView({ loaded, name, spectres, query, updateQuery }) {
  const [showSearchPane, setShowSearchPane] = useState(true);

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
        paneTitle={<FormattedMessage id="ui-cyclops.spectres.count" values={{ count: spectres?.data.length, name }} />}
        firstMenu={
          showSearchPane ? '' : (
            <IconButton icon="caret-right" onClick={() => setShowSearchPane(true)} />
          )
        }
      >
        {loaded
          ? renderList(spectres, query, updateQuery)
          : <Icon icon="spinner-ellipsis" />
        }
      </Pane>
    </Paneset>
  );
}
