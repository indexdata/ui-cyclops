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

// The condition that picks out a single spectre by id, in the structured form
// that the WSAPI's `jsonCond` takes (see cond-schema.json in mod-cyclops). The
// id is a number, so that the back end renders it as a numeric literal rather
// than a quoted string.
export function idCond(spectreId) {
  return { type: 'term', field: 'id', rel: 'eq', value: Number(spectreId) };
}

// The schemes that execute what follows them rather than locating something.
const EXECUTABLE_SCHEMES = ['javascript', 'data', 'vbscript'];

// A stored URL as it may safely be used in an href. Any scheme is allowed --
// ftp, urn, mailto and the rest are all legitimate things to record -- bar the
// three that run script, for which undefined is returned: React then renders no
// href at all, so the value is still shown but is not clickable.
//
// The scheme is read with the characters a browser discards when parsing a URL
// removed, since it discards them before deciding what the scheme is: spaces
// around the URL, and tabs and newlines anywhere within it. Neither a leading
// space nor a tab in the middle of the word can therefore smuggle one of these
// schemes past the check.
export function safeUrl(url) {
  if (typeof url !== 'string') return undefined;

  const bare = Array.from(url).filter(c => c > ' ').join('').toLowerCase();
  const colon = bare.indexOf(':');
  if (colon >= 0 && EXECUTABLE_SCHEMES.includes(bare.slice(0, colon))) return undefined;
  return url;
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

// How a list is identified in headings and navigation: its human-readable
// title where it has one, falling back to its display name otherwise. The
// fallback covers a list whose title has never been set, and also the moment
// before the title has been fetched.
export function listDisplayTitle(title, name, intl) {
  return title || listDisplayName(name, intl);
}

export default listDisplayName;
