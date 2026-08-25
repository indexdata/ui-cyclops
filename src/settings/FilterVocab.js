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
// present the same manifest.
FilterVocab.manifest = ControlledVocab.manifest;

export default FilterVocab;
