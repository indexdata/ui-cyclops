import React from 'react';
import { useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Button, ButtonGroup } from '@folio/stripes/components';
import packageInfo from '../package';
import { useNav } from './NavContext';


const segments = [{
  name: 'home',
  needSelected: false,
}, {
  name: 'project',
  needSelected: true,
}, {
  name: 'list',
  needSelected: true,
}];


function Tabs() {
  const location = useLocation();
  const base = packageInfo.stripes.route.replace(/^\//, '');
  const nav = useNav();

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5em' }}>
        <ButtonGroup>
          {
            segments.map(({ name, needSelected }) => {
              const segmentNav = nav[name];
              const fullBase = '/' + base + '/';
              const effectiveTab = location.pathname.replace(fullBase, '').replace(/\/.*/, '');
              const selected = (effectiveTab === name);
              const disabled = needSelected && !segmentNav?.name;
              return (
                <Button
                  key={`${name}`}
                  to={`/${base}/${name}/${segmentNav?.id || ''}`}
                  buttonStyle={selected ? 'primary' : 'default'}
                  disabled={disabled}
                >
                  <FormattedMessage
                    id={`ui-cyclops.tab.${name}`}
                    values={{ name: segmentNav?.name }}
                  />
                </Button>
              );
            })
          }
        </ButtonGroup>
      </div>
    </>
  );
}

export default Tabs;
