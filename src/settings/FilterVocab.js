import React, { useMemo } from 'react';
import { ControlledVocab } from '@folio/stripes/smart-components';

// Two independent fixes to ControlledVocab, needed before it can serve the
// Filters settings page. Everything else about that page is ordinary
// ControlledVocab configuration and lives in FilterSettings.js.
//
// The first is an adaptation: ControlledVocab expects records to carry an `id`,
// which filters do not. The second is not about filters at all — it works
// around a bug in ControlledVocab's own error path that any vocabulary would
// hit on a failed delete; we hit it because our DELETE endpoint does not exist
// on the back end yet.

class PatchedControlledVocab extends ControlledVocab {
  // When a DELETE fails, ControlledVocab's own catch calls `deleteItemReject()`
  // with no arguments, discarding the response; EditableListForm then passes
  // that `undefined` to processBadResponse, which dereferences `.status` and
  // crashes before the failure can be reported. Reject with something
  // response-shaped so the generic "could not be removed" message is shown
  // (alongside ControlledVocab's own "Cannot delete filter" dialog) instead.
  // Because the real response is discarded upstream, the status cannot be
  // recovered here, so the message is generic rather than status-specific.
  showConfirmDialog(itemId) {
    return super.showConfirmDialog(itemId).catch((error) => {
      throw error ?? { status: 500 };
    });
  }
}

// The WSAPI returns filters as { project, filter, definition } with no primary
// key, but ControlledVocab addresses records as `baseUrl/{id}` and, when
// confirming a deletion, looks the row up by id in the *unparsed* records — so
// decorating rows with `parseRow` is too late. Interpose here instead, so that
// ControlledVocab never sees a record without an id. Re-qualifying the name
// reconstitutes the identifier the filter was created under.
function FilterVocab({ resources, ...rest }) {
  const { values } = resources;
  const records = values?.records;

  const patched = useMemo(() => (
    values
      ? { ...resources, values: { ...values, records: (records || []).map(r => ({ ...r, id: `${r.project}.${r.filter}` })) } }
      : resources
  ), [resources, values, records]);

  return <PatchedControlledVocab {...rest} resources={patched} />;
}

// This component stands in for ControlledVocab at connect time, so it must
// present the same manifest -- except for the fetch of the filters themselves.
// Filters are namespaced to their project, and the WSAPI selects them
// server-side with `?project=NAME`, so ask it for only the chosen project's
// filters rather than fetching them all and discarding the rest. The project
// has to go into the GET path, because ControlledVocab's own GET path already
// ends in a query-string of its own, so there is nowhere else to append a
// parameter: `baseUrl` is interpolated ahead of the `?`. Until a project has
// been chosen there is nothing to ask for, and a null path suppresses the
// fetch entirely.
FilterVocab.manifest = Object.freeze({
  ...ControlledVocab.manifest,
  values: {
    ...ControlledVocab.manifest.values,
    GET: {
      // The query-string is assembled rather than interpolated, so that a
      // project name containing '&' or '#' cannot add parameters of its own.
      path: (_queryParams, _pathParams, _localResources, _logger, props) => {
        if (!props.projectId) return null;

        const params = new URLSearchParams({
          query: `cql.allRecords=1 sortby ${props.sortby || 'name'}`,
          limit: '2000',
          project: props.projectId,
        });
        return `${props.baseUrl}?${params}`;
      },
    },
  },
});

export default FilterVocab;
