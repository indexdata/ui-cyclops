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
