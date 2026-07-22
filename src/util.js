import React from 'react';
import { FormattedMessage } from 'react-intl';

// Run an async mutation and report the outcome through a callout: `successId`
// on success, `failureId` on failure (with the response's status/statusText/
// body folded into `values`). `values` are shared by both messages. Returns
// true iff the mutation succeeded, so callers can gate a follow-on step.
export async function mutateWithCallout(callout, op, { values = {}, successId, failureId }) {
  try {
    await op();
    callout.sendCallout({
      message: <FormattedMessage id={successId} values={values} />,
    });
    return true;
  } catch (res) {
    callout.sendCallout({
      type: 'error',
      timeout: 0,
      message: (
        <FormattedMessage
          id={failureId}
          values={{
            ...values,
            status: res.status,
            statusText: res.statusText,
            body: await res.text(),
          }}
        />
      ),
    });
    return false;
  }
}

// Render the display name of a list. The "master list" of a project is named
// `PROJECTNAME.object`, and is shown using a localized label; every other list
// is shown with its leading project-name and period stripped.
export function listDisplayName(name, intl) {
  if (name === undefined) return undefined;
  if (name.endsWith('.object')) {
    return intl.formatMessage({ id: 'ui-cyclops.master-list' });
  }
  return name.replace(/.*\./, '');
}

export default listDisplayName;
