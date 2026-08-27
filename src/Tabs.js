import React from 'react';
import { useLocation } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { Button, ButtonGroup } from '@folio/stripes/components';
import packageInfo from '../package';
import { useNav } from './NavContext';
import { listDisplayTitle } from './util';


const segmentsConfig = [{
  name: 'home',
  renderName: () => 'UNUSED',
  makeLink: () => `${packageInfo.stripes.route}/home`,
}, {
  name: 'project',
  renderName: (r, nav) => r.name || nav.list.name?.replace(/\..*/, ''),
  makeLink: (nav) => {
    const pname = nav.list.name?.replace(/\..*/, '');
    return pname === undefined ? undefined : `${packageInfo.stripes.route}/project/${pname}`;
  }
}, {
  name: 'list',
  renderName: (r, nav, intl) => listDisplayTitle(r.title, r.name, intl),
  makeLink: () => undefined, // If we've not visited this tab, we have no way to choose a list
}];


function Tabs() {
  const location = useLocation();
  const fullBase = `${packageInfo.stripes.route}/`;
  const effectiveTab = location.pathname.replace(fullBase, '').replace(/\/.*/, '');
  const nav = useNav();
  const intl = useIntl();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5em' }}>
      <ButtonGroup>
        {
          segmentsConfig.map(({ name, renderName, makeLink }) => {
            const segmentNav = nav[name];
            const sl = segmentNav.location;
            const to = sl ? `${sl.pathname}${sl.search}` : makeLink(nav);
            const renderedName = renderName(segmentNav, nav, intl);

            return (
              <Button
                key={name}
                to={to}
                buttonStyle={effectiveTab === name ? 'primary' : 'default'}
                disabled={!renderedName}
              >
                <FormattedMessage
                  id={`ui-cyclops.tab.${name}`}
                  values={{ name: renderedName }}
                />
              </Button>
            );
          })
        }
      </ButtonGroup>
    </div>
  );
}

export default Tabs;
