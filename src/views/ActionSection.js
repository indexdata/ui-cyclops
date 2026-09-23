import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { IconButton, Row, Col, Button, Select } from '@folio/stripes/components';
import { useNav } from '../NavContext';

// The dropdowns all offer the same thing: one of the { id, name } entries
// defined on the project, or nothing at all, which the leading empty option
// represents. A project need not define any of them.
const options = (entries) => [
  { value: '', label: '' },
  ...(entries || []).map(x => ({ value: x.id, label: x.name })),
];

function ActionSection({ project, spectre, onChangeFund, onChangeTrack, onDecide }) {
  const nav = useNav();
  const actionName = nav?.project?.action?.name;
  // Fund and track values from the server may be of the form "id:description";
  // we only care about the id, which is what the dropdown options are keyed on.
  const currentFund = spectre?.fund?.replace(/:.*/, '') || '';
  const currentTrack = spectre?.track?.replace(/:.*/, '') || '';

  // Seed from the spectre's current fund, falling back to an empty selection
  // when none is defined. The leading empty option lets that state be shown.
  const [fund, setFund] = useState(currentFund);
  const [track, setTrack] = useState(currentTrack);

  // Re-sync when the underlying spectre changes — either navigating between
  // spectres or the resource finishing an asynchronous refetch. Without this,
  // the locally-held value stays stale whenever the component is reused before
  // the new spectre's data has arrived.
  useEffect(() => { setFund(currentFund); }, [currentFund]);
  useEffect(() => { setTrack(currentTrack); }, [currentTrack]);

  const handleChangeFund = (e) => {
    setFund(e.target.value);
    onChangeFund(e.target.value);
  };

  const handleChangeTrack = (e) => {
    setTrack(e.target.value);
    onChangeTrack(e.target.value);
  };

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
        <Select label="Fund" dataOptions={options(project.funds)} value={fund} onChange={handleChangeFund} />
        <Select label="Track" dataOptions={options(project.tracks)} value={track} onChange={handleChangeTrack} />
      </Col>
      <Col xs={4}>
        <Select label="Origin" dataOptions={options(project.origins)} />
        <Select label="Destination" dataOptions={options(project.destinations)} />
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
