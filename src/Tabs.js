import React from 'react';
import { useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Button, ButtonGroup } from '@folio/stripes/components';
import packageInfo from '../package';
import { useNav } from './NavContext';


const segmentsConfig = [{
  name: 'home',
  renderName: undefined
}, {
  name: 'project',
  renderName: r => r.name,
}, {
  name: 'list',
  renderName: r => r.name?.replace(/.*\./, ''),
}];


function Tabs() {
  const location = useLocation();
  const base = packageInfo.stripes.route.replace(/^\//, '');
  const nav = useNav();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5em' }}>
      <ButtonGroup>
        {
          segmentsConfig.map(({ name, renderName }) => {
            const segmentNav = nav[name];
            const fullBase = '/' + base + '/';
            const effectiveTab = location.pathname.replace(fullBase, '').replace(/\/.*/, '');
            const sl = segmentNav.location;
            const to = sl ? `${sl.pathname}${sl.search}` : `${packageInfo.stripes.route}/${name}`;
            const selected = (effectiveTab === name);
            const disabled = renderName && !renderName(segmentNav);
            return (
              <Button
                key={`${name}`}
                to={to}
                buttonStyle={selected ? 'primary' : 'default'}
                disabled={disabled}
              >
                <FormattedMessage
                  id={`ui-cyclops.tab.${name}`}
                  values={{ name: renderName && renderName(segmentNav) }}
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
