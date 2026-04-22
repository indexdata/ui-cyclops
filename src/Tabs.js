import React from 'react';
import { useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Button, ButtonGroup } from '@folio/stripes/components';
import packageInfo from '../package';
import { useNav } from './NavContext';


const segmentsConfig = [{
  name: 'home',
  idField: undefined
}, {
  name: 'project',
  idField: 'altName'
}, {
  name: 'list',
  idField: 'name'
}];


function Tabs() {
  const location = useLocation();
  const base = packageInfo.stripes.route.replace(/^\//, '');
  const nav = useNav();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5em' }}>
      <ButtonGroup>
        {
          segmentsConfig.map(({ name, idField }) => {
            const segmentNav = nav[name];
            const fullBase = '/' + base + '/';
            const effectiveTab = location.pathname.replace(fullBase, '').replace(/\/.*/, '');
            const sl = segmentNav.location;
            const to = sl ? `${sl.pathname}${sl.search}` : `${packageInfo.stripes.route}/${name}`;
            const selected = (effectiveTab === name);
            const disabled = idField && !segmentNav[idField];
            return (
              <Button
                key={`${name}`}
                to={to}
                buttonStyle={selected ? 'primary' : 'default'}
                disabled={disabled}
              >
                <FormattedMessage
                  id={`ui-cyclops.tab.${name}`}
                  values={{ name: segmentNav[idField] }}
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
