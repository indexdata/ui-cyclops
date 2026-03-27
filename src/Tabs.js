import React from 'react';
import { useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Button, ButtonGroup } from '@folio/stripes/components';
import packageInfo from '../package';


const segments = [{
  name: 'projects',
  // We may add more elements here later
}, {
  name: 'lists',
}, {
  name: 'spectres',
}];


function Tabs() {
  const location = useLocation();
  const base = packageInfo.stripes.route.replace(/^\//, '');

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5em' }}>
        <ButtonGroup>
          {
            segments.map(({ name }) => {
              const fullBase = '/' + base + '/';
              const effectiveTab = location.pathname.replace(fullBase, '').replace(/\/.*/, '');
              const selected = (effectiveTab === name);
              return (
                <Button
                  key={`${name}`}
                  to={`/${base}/${name}`}
                  buttonStyle={selected ? 'primary' : 'default'}
                >
                  <FormattedMessage id={`ui-cyclops.tab.${name}`} />
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
