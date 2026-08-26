import React, { useRef } from 'react';
import { matchPath } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { Select } from '@folio/stripes/components';
import { stripesConnect, useStripes } from '@folio/stripes/core';
import FilterVocab from './FilterVocab';

function FilterSettings(props) {
  const stripes = useStripes();
  const intl = useIntl();

  // The selected project lives in the UI URL — /settings/cyclops/filters/PROJECT —
  // so the page can be linked to and survives a reload. Settings registers this
  // page on a non-exact route with no parameters of its own, so the trailing
  // segment has to be matched here rather than read from props.match.params.
  const projectMatch = matchPath(props.location.pathname, {
    path: `${props.match.path}/:projectId`,
  });
  const projectId = projectMatch?.params?.projectId || '';
  const selectProject = (id) => props.history.push(
    id ? `${props.match.url}/${id}` : props.match.url
  );

  // Connect ControlledVocab exactly once for the lifetime of this component.
  // Connecting during render (e.g. in useMemo keyed on `stripes`) risks
  // rebuilding — and therefore remounting — ControlledVocab if the stripes
  // identity changes, which briefly lets its internal Paneset register as a
  // root paneset and take over the whole screen instead of nesting as the
  // right-hand pane beside the settings nav.
  const connectedRef = useRef(null);
  if (!connectedRef.current) {
    connectedRef.current = stripes.connect(FilterVocab);
  }
  const ConnectedControlledVocab = connectedRef.current;

  const projects = props.resources.projects?.records?.[0]?.projects || [];

  const projectSelector = (
    <Select
      label={intl.formatMessage({ id: 'ui-cyclops.settings.filters.project' })}
      value={projectId}
      onChange={(e) => selectProject(e.target.value)}
      dataOptions={[
        { value: '', label: '' },
        ...projects.map(p => ({ value: p.id, label: p.name || p.id })),
      ]}
    />
  );

  return (
    <ConnectedControlledVocab
      stripes={stripes}
      baseUrl="cyclops/filters"
      records="filters"
      label={intl.formatMessage({ id: 'ui-cyclops.settings.filters' })}
      translations={{
        cannotDeleteTermHeader: 'ui-cyclops.cv.filters.cannotDeleteTermHeader',
        cannotDeleteTermMessage: 'ui-cyclops.cv.filters.cannotDeleteTermMessage',
        deleteEntry: 'ui-cyclops.cv.filters.deleteEntry',
        termDeleted: 'ui-cyclops.cv.filters.termDeleted',
        termWillBeDeleted: 'ui-cyclops.cv.filters.termWillBeDeleted',
      }}
      objectLabel={intl.formatMessage({ id: 'ui-cyclops.settings.filters.objectLabel' })}
      visibleFields={['filter', 'definition']}
      columnMapping={{
        filter: intl.formatMessage({ id: 'ui-cyclops.settings.filters.name' }),
        definition: intl.formatMessage({ id: 'ui-cyclops.settings.filters.definition' }),
      }}
      id="filters"
      sortby="filter"
      // Filters are created from a search on the list page and cannot be
      // amended in place, so this page offers deletion and nothing else.
      // `editable` must stay true: it gates the whole actions column, delete
      // included. Editing is instead ruled out by making every field read-only
      // and suppressing the edit action.
      readOnlyFields={['filter', 'definition']}
      canCreate={false}
      hideCreateButton
      actionSuppressor={{ edit: () => true, delete: () => false }}
      clientGeneratePk={false}
      rowFilter={projectSelector}
      projectId={projectId}
      listSuppressor={() => !projectId}
      // Filters are namespaced to their project, so the list is only meaningful
      // once a project has been chosen: until then, suppress it entirely.
      listSuppressorText={<FormattedMessage id="ui-cyclops.settings.filters.chooseProject" />}
      hiddenFields={['lastUpdated', 'numberOfObjects']}
    />
  );
}

FilterSettings.manifest = Object.freeze({
  projects: {
    type: 'okapi',
    path: 'cyclops/projects',
  },
});

export default stripesConnect(FilterSettings);
