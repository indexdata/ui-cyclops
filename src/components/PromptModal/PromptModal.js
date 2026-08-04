import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal, ModalFooter, Select } from '@folio/stripes/components';

// A set's name is used unquoted in CCMS queries, so restrict it to a
// conservative identifier syntax: a letter followed by letters, digits and
// underscores.
const VALID_NAME = /^[A-Za-z][0-9A-Za-z_]*$/;

const PromptModal = ({
  heading,
  onConfirm,
  onCancel,
  open,
  message,
  filters,
}) => {
  const [value, setValue] = useState('');
  // Empty string (not undefined) keeps the Select a controlled component
  const [filter, setFilter] = useState('');

  const invalid = value !== '' && !VALID_NAME.test(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value || invalid) return;
    setValue('');
    onConfirm(value, filter || undefined);
  };

  // The modal stays mounted when closed, so clear the entered name -- otherwise
  // it (and any validation error) is still there next time it is opened.
  const handleCancel = () => {
    setValue('');
    onCancel();
  };

  const footer = (
    <ModalFooter>
      <Button buttonStyle="primary" disabled={!value || invalid} onClick={handleSubmit}>
        <FormattedMessage id="stripes-components.submit" />
      </Button>
      <Button buttonStyle="default" onClick={handleCancel}>
        <FormattedMessage id="stripes-components.cancel" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      label={heading}
      scope="module"
      size="small"
      footer={footer}
    >
      <p>
        {message}
      </p>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            style={{ width: '100%', boxSizing: 'border-box' }}
            name="value"
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
          {invalid && (
            <div role="alert" style={{ color: '#900', marginTop: '0.25em' }}>
              <FormattedMessage id="ui-cyclops.prompt.name.invalid" />
            </div>
          )}
          {filters && (
            <Select
              label={<FormattedMessage id="ui-cyclops.prompt.filter.label" />}
              value={filter}
              onChange={e => setFilter(e.target.value)}
              dataOptions={[
                { value: '', label: '' },
                ...filters.map(f => ({ value: f, label: f })),
              ]}
            />
          )}
        </form>
      </div>
    </Modal>
  );
};

export default PromptModal;
