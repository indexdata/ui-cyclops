/* eslint-disable no-use-before-define */

import React, { useMemo } from 'react';
import { stripesConnect } from '@folio/stripes/core';
import { StripesConnectedSource } from '@folio/stripes/smart-components';
import ListView, { DEFAULT_QINDEX } from '../views/ListView';
import { idCond } from '../util';

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

  // The user's own search, without the auto-filter: what "Save search" saves,
  // what a new list is populated from, and what "Create list" is enabled by.
  // The auto-filter belongs to the list on view rather than to the search, and
  // is folded in only where the list itself is fetched (see jsonCondFn).
  const searchCond = () => condFromClauses(clausesFromQuery(resources));
  const saveSearch = (name) => mutator.saveFilter.POST({ name, jsonCond: searchCond() });

  // A set's own record -- as opposed to its contents, which is what the
  // `spectres` resource holds -- comes from the project's list of sets, whose
  // entries are qualified as `project.set`. Both the set on view and the one
  // that spectres are being added from (always of the same project) are looked
  // up, as each is named in the heading.
  const listName = match.params.setId;
  const findSet = (qualifiedName) => resources.setsToFindThisSet?.records?.[0]?.sets
    ?.find(entry => `${entry.project}.${entry.set}` === qualifiedName);
  const setRecord = findSet(listName);
  const addFromRecord = addFrom ? findSet(addFrom) : undefined;

  // CCMS's "alter set" takes the whole set structure, so the name goes along
  // with the new title even though the URL already carries it.
  const updateList = (title) => mutator.thisSet.PUT({ name: listName, title });

  // Fill a newly-created set with the records of the present search result:
  // the same source set that is on view, matched by the same condition.
  const populateList = async (setName) => {
    await mutator.populateTarget.update({ setName });
    return mutator.populateSet.POST({
      from: addFrom || match.params.setId,
      jsonCond: searchCond(),
    });
  };

  return (
    <ListView
      loaded={loaded}
      name={listName}
      projectId={match.params.projectId}
      action={action}
      batchUpdate={(ids, changes) => mutator.batch.POST({ ids, changes })}
      listTitle={setRecord?.title}
      addFromTitle={addFromRecord?.title}
      updateList={updateList}
      spectres={spectresResource.records[0]}
      spectreCount={spectreCount}
      query={resources.query}
      updateQuery={mutator.query.update}
      savedFilters={resources.filters?.records?.[0]?.filters || []}
      autoFilter={addFrom ? undefined : autoFilterFor(listName, resources)}
      addFrom={addFrom}
      addList={(name, title) => mutator.setsToCreateIn.POST(title ? { name, title } : { name })}
      populateList={populateList}
      hasSearch={!!searchCond()}
      addSpectre={(spectreId) => mutator.addToList.POST({ from: addFrom, jsonCond: idCond(spectreId) })}
      removeSpectre={(spectreId) => mutator.removeFromList.POST({ jsonCond: idCond(spectreId) })}
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

// The search as a list of condition clauses in the structured form that the
// WSAPI's `jsonCond` parameter takes (see cond-schema.json in mod-cyclops).
// Relation names are abstract -- `contains`, `ge` -- rather than CCMS
// operators: mod-cyclops chooses the operator and quotes the value, so nothing
// here has to be escaped and nothing a user types can be read as syntax.
function clausesFromQuery(resources) {
  const clauses = [];

  // One index/value pair per search row, ANDed together with everything else
  // below. A row with nothing entered contributes no clause.
  const qindexes = [].concat(resources.query.qindex || []);
  const values = [].concat(resources.query.query || []);
  values.forEach((query, i) => {
    if (!query) return;
    const qindex = qindexes[i] || DEFAULT_QINDEX;
    // `contains` takes the bare term: the wildcards that make it a substring
    // match, and the escaping of any wildcard character within the term, are
    // the back end's business.
    const rel = SUBSTRING_QINDEXES.includes(qindex) ? 'contains' : 'eq';
    clauses.push({ type: 'term', field: qindex, rel, value: query });
  });

  const availability = resources.query.availability;
  if (availability) {
    clauses.push({ type: 'term', field: 'availability', rel: 'eq', value: availability });
  }

  // Numeric holdings-count filter: only apply when a value has been entered,
  // and only honour the two supported comparison operators.
  const holdingsCount = resources.query.holdingsCount;
  if (holdingsCount !== undefined && holdingsCount !== '' && !Number.isNaN(Number(holdingsCount))) {
    const rel = resources.query.holdingsCountOp === 'lte' ? 'le' : 'ge';
    clauses.push({ type: 'term', field: 'holdings_count', rel, value: Number(holdingsCount) });
  }

  // Tri-state decision filter: only constrain when explicitly set to one of
  // the two boolean values (an empty value means "either").
  const decision = resources.query.decision;
  if (decision === 'true' || decision === 'false') {
    clauses.push({ type: 'term', field: 'decision', rel: 'eq', value: decision === 'true' });
  }

  // query-string yields a bare string for a single value and an array for
  // several, so normalise to an array before iterating.
  const filters = [].concat(resources.query.filters || []);
  filters.forEach(filterName => clauses.push({ type: 'filter', name: filterName }));

  return clauses;
}

// A list of clauses as a single condition: the one clause itself when there is
// only one, and a conjunction of them all when there are several. No clauses
// means no condition, which is undefined rather than null -- a null query
// parameter tells stripes-connect to suppress the fetch entirely.
function condFromClauses(clauses) {
  if (clauses.length === 0) return undefined;
  if (clauses.length === 1) return clauses[0];
  return { type: 'and', clauses };
}

// A list may have a filter that is always applied to it, over and above
// whatever the user searches for: the list named LNAME is automatically
// filtered by the filter called LNAME_auto, when the project defines one.
// Filters are unqualified within a project, whereas a set is named
// `project.set`, so the leading project-name is stripped before appending the
// suffix. Returns the filter's name when it exists, and undefined otherwise:
// most lists have no auto-filter.
function autoFilterFor(setName, resources) {
  if (!setName) return undefined;
  const wanted = `${setName.replace(/.*\./, '')}_auto`;
  const filters = resources.filters?.records?.[0]?.filters || [];
  return filters.some(f => f.filter === wanted) ? wanted : undefined;
}

// Used as a query-parameter function in two manifest entries. A query parameter
// cannot itself be structured, so the condition travels as its JSON text; in a
// POST body it goes as the structure itself.
//
// The filters are read from `props` rather than from `resources` because this
// is also what tells stripes-connect that the fetch needs re-running once they
// arrive: shouldRefresh() evaluates the old and the new options against a
// single store state, so `resources` looks identical both times (see the
// spectreCount path below for the same point at greater length).
function jsonCondFn(queryParams, pathParams, resources, _logger, props) {
  const clauses = clausesFromQuery(resources);

  // The auto-filter narrows what the list shows of its own contents, so it has
  // no place in the other thing this fetch does: listing another list's
  // spectres as candidates to add to this one. That is a search of the list
  // being added *from*, and this list's criteria are not its business.
  const autoFilter = queryParams.addFrom ? undefined : autoFilterFor(pathParams.setId, props.resources);
  if (autoFilter) clauses.push({ type: 'filter', name: autoFilter });

  const cond = condFromClauses(clauses);
  return cond && JSON.stringify(cond);
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
  // Fetched for the sake of this set's own title: there is no WSAPI operation
  // that returns a single set.
  setsToFindThisSet: {
    type: 'okapi',
    path: 'cyclops/projects/:{projectId}/sets',
  },
  resultCount: { initialValue: INITIAL_RESULT_COUNT },
  resultOffset: { initialValue: 0 },
  spectres: {
    type: 'okapi',
    path: (queryParams, pathParams, _resources, _logger, props) => {
      // console.log('queryParams =', queryParams, '-- pathParams =', pathParams);
      // The list's auto-filter, if it has one, is part of the condition, so
      // there is nothing worth fetching until the project's filters are known:
      // a fetch issued before then would show the list unfiltered and then
      // replace it. As with spectreCount below, the filters are read from
      // `props` so that their arrival is seen as a change worth refetching for.
      // No auto-filter applies when adding from another list, so there is
      // nothing to wait for in that case.
      if (!queryParams.addFrom && !props.resources.filters?.hasLoaded) return null;
      return `cyclops/sets/${queryParams.addFrom || pathParams.setId}`;
    },
    params: {
      fields: '*',
      jsonCond: jsonCondFn,
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
      jsonCond: jsonCondFn,
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
  setsToCreateIn: {
    type: 'okapi',
    path: 'cyclops/sets',
    fetch: false,
    POST: {
      throwErrors: false,
    },
  },
  // The set that is on view, for altering its title.
  thisSet: {
    type: 'okapi',
    path: 'cyclops/sets/:{setId}',
    fetch: false,
    throwErrors: false,
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
