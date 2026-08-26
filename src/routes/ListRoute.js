import React, { useMemo } from 'react';
import { stripesConnect } from '@folio/stripes/core';
import { StripesConnectedSource } from '@folio/stripes/smart-components';
import ListView, { DEFAULT_QINDEX } from '../views/ListView';

const INITIAL_RESULT_COUNT = 20;
const RESULT_COUNT_INCREMENT = 20;

// The searchable indexes that are matched as substrings, case-insensitively:
// any other is matched exactly.
const SUBSTRING_QINDEXES = ['title', 'author', 'full_vendor_name'];

function ListRoute({ stripes, resources, mutator, children, location, match }) {
  const source = useMemo(() => {
    return new StripesConnectedSource({ resources, mutator }, stripes.logger, 'spectres');
  }, [resources, mutator, stripes.logger]);

  const handleNeedMoreData = (_askAmount, index) => {
    source.fetchOffset(index);
  };

  const query = new URLSearchParams(location.search);
  const addFrom = query.get('addFrom');
  const spectresResource = resources.spectres;
  const loaded = spectresResource && spectresResource.hasLoaded;
  const action = resources.project?.records?.[0]?.action;

  // Since the count is fetched only after the records (see the manifest), the
  // previous search's count lingers for as long as the new search takes, plus
  // the time to count it. It is the count of what is on view only if it was
  // fetched later than the records themselves; until then, report no count, so
  // that the view falls back to "at least so many records".
  const countResource = resources.spectreCount;
  const counted = countResource.loadedAt >= spectresResource.loadedAt;
  const spectreCount = counted ? countResource.records[0]?.data[0].values[0] : undefined;

  // eslint-disable-next-line no-use-before-define
  const saveSearch = (name) => mutator.saveFilter.POST({ name, cond: condFn(null, null, resources) });

  // Fill a newly-created set with the records of the present search result:
  // the same source set that is on view, matched by the same condition.
  const populateList = async (setName) => {
    await mutator.populateTarget.update({ setName });
    return mutator.populateSet.POST({
      from: addFrom || match.params.setId,
      // eslint-disable-next-line no-use-before-define
      cond: condFn(null, null, resources),
    });
  };

  return (
    <ListView
      loaded={loaded}
      name={match.params.setId}
      projectId={match.params.projectId}
      action={action}
      batchUpdate={(ids, changes) => mutator.batch.POST({ ids, changes })}
      spectres={spectresResource.records[0]}
      spectreCount={spectreCount}
      query={resources.query}
      updateQuery={mutator.query.update}
      savedFilters={resources.filters?.records?.[0]?.filters || []}
      addFrom={addFrom}
      addList={(name, title) => mutator.allSets.POST(title ? { name, title } : { name })}
      populateList={populateList}
      // eslint-disable-next-line no-use-before-define
      hasSearch={!!condFn(null, null, resources)}
      addSpectre={(spectreId) => mutator.addToList.POST({ from: addFrom, cond: `id = ${spectreId}` })}
      removeSpectre={(spectreId) => mutator.removeFromList.POST({ cond: `id = ${spectreId}` })}
      saveSearch={saveSearch}
      pageAmount={RESULT_COUNT_INCREMENT}
      onNeedMoreData={handleNeedMoreData}
      pagingOffset={resources.resultOffset}
      XXX_error_so_we_can_handle_errors_politely={undefined}
    >
      {children}
    </ListView>
  );
}

// Used as a query-parameter function in two manifest entries, and to build
// the condition when saving a search as a filter.
function condFn(_a, _b, resources) {
  const clauses = [];

  // One index/value pair per search row, ANDed together with everything else
  // below. A row with nothing entered contributes no clause.
  const qindexes = [].concat(resources.query.qindex || []);
  const values = [].concat(resources.query.query || []);
  values.forEach((query, i) => {
    if (!query) return;
    const qindex = qindexes[i] || DEFAULT_QINDEX;
    if (SUBSTRING_QINDEXES.includes(qindex)) {
      clauses.push(`${qindex} ilike '%${query}%'`);
    } else {
      clauses.push(`${qindex} = '${query}'`);
    }
  });

  const availability = resources.query.availability;
  if (availability) {
    clauses.push(`availability = '${availability}'`);
  }

  // Numeric holdings-count filter: only apply when a value has been entered,
  // and only honour the two supported comparison operators.
  const holdingsCount = resources.query.holdingsCount;
  if (holdingsCount !== undefined && holdingsCount !== '' && !Number.isNaN(Number(holdingsCount))) {
    const op = resources.query.holdingsCountOp === 'lte' ? '<=' : '>=';
    clauses.push(`holdings_count ${op} ${Number(holdingsCount)}`);
  }

  // Tri-state decision filter: only constrain when explicitly set to one of
  // the two boolean values (an empty value means "either").
  const decision = resources.query.decision;
  if (decision === 'true' || decision === 'false') {
    clauses.push(`decision = ${decision}`);
  }

  // query-string yields a bare string for a single value and an array for
  // several, so normalise to an array before iterating.
  const filters = [].concat(resources.query.filters || []);
  filters.forEach(filterName => clauses.push(`filter(${filterName})`));

  return clauses.join(' and ');
}

ListRoute.manifest = Object.freeze({
  query: {},
  project: {
    type: 'okapi',
    path: 'cyclops/projects/:{projectId}',
  },
  filters: {
    type: 'okapi',
    path: 'cyclops/filters',
    params: { project: ':{projectId}' },
  },
  resultCount: { initialValue: INITIAL_RESULT_COUNT },
  resultOffset: { initialValue: 0 },
  spectres: {
    type: 'okapi',
    path: (queryParams, pathParams) => {
      // console.log('queryParams =', queryParams, '-- pathParams =', pathParams);
      return `cyclops/sets/${queryParams.addFrom || pathParams.setId}`;
    },
    params: {
      fields: '*',
      cond: condFn,
      sort: (_a, _b, resources) => {
        const s = resources.query.sort;
        if (!s) {
          return 'id'; // CCMS requires an explicit sort-order in order to do paging
        } else if (s.startsWith('-')) {
          return s.replace('-', '') + ' desc';
        } else {
          return s;
        }
      },
      offset: '%{resultOffset}',
      limit: `${RESULT_COUNT_INCREMENT}`,
      // XXX The following are not yet supported by CCMS
      // filter: 'jurassic',
      // tag: 'dino,ptero',
    },
  },
  spectreCount: {
    type: 'okapi',
    // It's inefficient for CCMS to run this alongside the (faster) fetch of
    // the actual records, so the path is null -- meaning "do not fetch" --
    // until those records are in.
    //
    // Two views of the spectres are needed to say when that is. `props` holds
    // the copy the component last rendered with, and is the only one
    // stripes-connect notices a change in: shouldRefresh() evaluates the old
    // and the new options against a single store state, so anything read from
    // `resources` (which is built from that state) looks identical both times,
    // and no fetch is ever dispatched. `resources` holds the store as it is at
    // this instant, and so is the only one that is up to date when a fetch is
    // about to be dispatched -- which is how we see that a new search has
    // already begun, the records last rendered being the previous search's.
    path: (queryParams, pathParams, resources, _logger, props) => {
      const rendered = props.resources.spectres;
      const current = resources.spectres;
      if (!rendered?.hasLoaded || rendered.isPending || current?.isPending) return null;

      // Otherwise, the same path as for the main 'spectres' manifest entry
      return `cyclops/sets/${queryParams.addFrom || pathParams.setId}`;
    },
    params: {
      countOnly: true,
      cond: condFn,
    },
  },
  addToList: {
    type: 'okapi',
    path: 'cyclops/sets/:{setId}/add',
    fetch: false,
    throwErrors: false,
  },
  removeFromList: {
    type: 'okapi',
    path: 'cyclops/sets/:{setId}/remove',
    fetch: false,
    throwErrors: false,
  },
  allSets: {
    type: 'okapi',
    path: 'cyclops/sets',
    fetch: false,
    POST: {
      throwErrors: false,
    },
  },
  populateTarget: {},
  populateSet: {
    type: 'okapi',
    path: (_q, _p, resources) => `cyclops/sets/${resources.populateTarget?.setName}/add`,
    fetch: false,
    throwErrors: false,
  },
  saveFilter: {
    type: 'okapi',
    path: 'cyclops/filters',
    fetch: false,
    throwErrors: false,
  },
  batch: {
    type: 'okapi',
    path: 'cyclops/sets/:{projectId}.object/batch',
    fetch: false,
    clientGeneratePk: false,
    throwErrors: false,
  },
});

export default stripesConnect(ListRoute);
