import React from 'react';
import { IconButton, Row, Col, Button, Select } from '@folio/stripes/components';

function ActionSection() {
  const fundOptions = [
    { value: 'fund1', label: 'PALCI cultural preservation' },
    { value: 'fund2', label: 'Coalition for Slavic literature' },
  ];

  const trackOptions = [
    { value: 'track1', label: 'Offsite' },
    { value: 'track2', label: 'Reserve' },
    { value: 'track3', label: 'Stacks' },
  ];

  const locationOptions = [
    { value: 'loc1', label: 'Lehigh' },
    { value: 'loc2', label: 'NYU' },
    { value: 'loc3', label: 'CLOCKSS' },
  ];

  return (
    <Row>
      {/* Replace text with 118n tags */}
      <Col xs={2} style={{ paddingTop: '1.7em' }}>
        <Button type="button">Buy</Button>
      </Col>
      <Col xs={4}>
        <Select label="Fund" dataOptions={fundOptions} />
        <Select label="Track" dataOptions={trackOptions} />
      </Col>
      <Col xs={4}>
        <Select label="Origin" dataOptions={locationOptions} />
        <Select label="Destination" dataOptions={locationOptions} />
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
