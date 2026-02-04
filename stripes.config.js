// Run as yarn stripes serve --port 4001 stripes.config.js

module.exports = {
  okapi: { 'url':'http://localhost:9130', 'tenant':'diku' },
  config: {
    logCategories: 'core,path,action,xhr',
    logPrefix: '--',
    maxUnpagedResourceCount: 2000,
    showPerms: false,
    preserveConsole: true,
    useSecureTokens: false,
  },

  modules: {
    // user-visible apps
    '@folio/cyclops' : {},
    '@folio/ldp' : {},
    '@folio/users' : {},
    '@indexdata/inventory-import' : {},

    // settings-only apps, plugins, etc
    // always listed alphabetically, if at all
    '@folio/developer' : {},
  },
};
