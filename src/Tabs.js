import React from 'react';
import { useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Button, ButtonGroup } from '@folio/stripes/components';
import packageInfo from '../package';
import { useNav } from './NavContext';


const segmentsConfig = [{
  name: 'home',
}, {
  name: 'project',
  idField: 'id',
}, {
  name: 'list',
  idField: 'name',
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
            const segmentState = nav[name];
            const fullBase = '/' + base + '/';
            const effectiveTab = location.pathname.replace(fullBase, '').replace(/\/.*/, '');
            const selected = (effectiveTab === name);
            const disabled = !!idField && !segmentState?.name;
            return (
              <Button
                key={`${name}`}
                to={`/${base}/${name}/${segmentState?.[idField] || ''}`}
                buttonStyle={selected ? 'primary' : 'default'}
                disabled={disabled}
              >
                <FormattedMessage
                  id={`ui-cyclops.tab.${name}`}
                  values={{ name: segmentState?.name }}
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
