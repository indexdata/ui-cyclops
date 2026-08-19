import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { IconButton, Row, Col, Button, Select } from '@folio/stripes/components';
import { useNav } from '../NavContext';

function ActionSection({ project, spectre, funds = [], onChangeFund, onDecide }) {
  const nav = useNav();
  const actionName = nav?.project?.action?.name;
  // The fund value from the server may be of the form "id:description"; we only
  // care about the id, which is what the dropdown options are keyed on.
  const currentFund = spectre?.fund?.replace(/:.*/, '') || '';

  // Seed from the spectre's current fund, falling back to an empty selection
  // when none is defined. The leading empty option lets that state be shown.
  const [fund, setFund] = useState(currentFund);

  // Re-sync when the underlying spectre changes — either navigating between
  // spectres or the resource finishing an asynchronous refetch. Without this,
  // the locally-held value stays stale whenever the component is reused before
  // the new spectre's data has arrived.
  useEffect(() => {
    setFund(currentFund);
  }, [currentFund]);

  const fundOptions = [
    { value: '', label: '' },
    ...funds.map(f => ({ value: f.name, label: f.title })),
  ];

  const handleChangeFund = (e) => {
    setFund(e.target.value);
    onChangeFund(e.target.value);
  };

  const trackOptions = [
    { value: 'track1', label: 'Offsite' },
    { value: 'track2', label: 'Reserve' },
    { value: 'track3', label: 'Stacks' },
  ];

  return (
    <Row>
      {/* Replace text with 118n tags */}
      <Col xs={2} style={{ paddingTop: '1.7em' }}>
        <Button
          type="button"
          disabled={!!spectre?.decision || !fund}
          onClick={onDecide}
        >
          {actionName || <FormattedMessage id="ui-cyclops.action.default" />}
        </Button>
      </Col>
      <Col xs={4}>
        <Select label="Fund" dataOptions={fundOptions} value={fund} onChange={handleChangeFund} />
        <Select label="Track" dataOptions={trackOptions} />
      </Col>
      <Col xs={4}>
        <Select label="Origin" dataOptions={project.origins.map(x => ({ value: x.id, label: x.name }))} />
        <Select label="Destination" dataOptions={project.destinations.map(x => ({ value: x.id, label: x.name }))} />
      </Col>
      <Col xs={2} style={{ paddingTop: '1.7em' }}>
        <div>
          <IconButton icon="envelope" />
        </div>
        <br />
        <div>
          <Button type="button">...</Button>
        </div>
      </Col>
    </Row>
  );
}

export default ActionSection;
