import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { useStripes } from '@folio/stripes/core';

// Turn a fund's name into a stable, backend-valid identifier: lowercase,
// with every run of non-alphanumeric characters collapsed to a single
// underscore and leading/trailing underscores trimmed.
function slug(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function FundSettings() {
  const stripes = useStripes();
  const intl = useIntl();

  // Connect ControlledVocab exactly once for the lifetime of this component.
  // Connecting during render (e.g. in useMemo keyed on `stripes`) risks
  // rebuilding — and therefore remounting — ControlledVocab if the stripes
  // identity changes, which briefly lets its internal Paneset register as a
  // root paneset and take over the whole screen instead of nesting as the
  // right-hand pane beside the settings nav.
  const connectedRef = useRef(null);
  if (!connectedRef.current) {
    connectedRef.current = stripes.connect(ControlledVocab);
  }
  const ConnectedControlledVocab = connectedRef.current;

  return (
    <ConnectedControlledVocab
      stripes={stripes}
      baseUrl="cyclops/funds"
      records="funds"
      label={intl.formatMessage({ id: 'ui-cyclops.settings.funds' })}
      translations={{
        cannotDeleteTermHeader: 'ui-cyclops.cv.funds.cannotDeleteTermHeader',
        cannotDeleteTermMessage: 'ui-cyclops.cv.funds.cannotDeleteTermMessage',
        deleteEntry: 'ui-cyclops.cv.funds.deleteEntry',
        termDeleted: 'ui-cyclops.cv.funds.termDeleted',
        termWillBeDeleted: 'ui-cyclops.cv.funds.termWillBeDeleted',
      }}
      objectLabel={intl.formatMessage({ id: 'ui-cyclops.settings.funds.objectLabel' })}
      visibleFields={['id', 'name']}
      columnMapping={{
        id: intl.formatMessage({ id: 'ui-cyclops.settings.funds.id' }),
        name: intl.formatMessage({ id: 'ui-cyclops.settings.funds.name' }),
      }}
      id="funds"
      sortby="name"
      readOnlyFields={['id']}
      // Let the backend own the id: don't inject a client-generated UUID (which
      // it rejects). Instead derive a valid identifier from the name on create.
      clientGeneratePk={false}
      preCreateHook={(item) => ({ ...item, id: slug(item.name) })}
      hiddenFields={['lastUpdated', 'numberOfObjects']}
    />
  );
}

export default FundSettings;
