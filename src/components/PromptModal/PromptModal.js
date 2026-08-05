import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal, ModalFooter, Select, TextField } from '@folio/stripes/components';

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
  withTitle,
}) => {
  const [value, setValue] = useState('');
  const [title, setTitle] = useState('');
  // Empty string (not undefined) keeps the Select a controlled component
  const [filter, setFilter] = useState('');

  const invalid = value !== '' && !VALID_NAME.test(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value || invalid) return;
    setValue('');
    setTitle('');
    onConfirm(value, { title: title || undefined, filter: filter || undefined });
  };

  // The modal stays mounted when closed, so clear what was entered -- otherwise
  // it (and any validation error) is still there next time it is opened.
  const handleCancel = () => {
    setValue('');
    setTitle('');
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
          <TextField
            label={<FormattedMessage id="ui-cyclops.prompt.name.label" />}
            name="value"
            value={value}
            onChange={e => setValue(e.target.value)}
            error={invalid ? <FormattedMessage id="ui-cyclops.prompt.name.invalid" /> : undefined}
          />
          {withTitle && (
            <TextField
              label={<FormattedMessage id="ui-cyclops.prompt.title.label" />}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          )}
          {filters && (
            <Select
              label={<FormattedMessage id="ui-cyclops.prompt.filter.label" />}
              value={filter}
              onChange={e => setFilter(e.target.value)}
              dataOptions={[
                { value: '', label: '' },
                ...filters.map(f => ({ value: f.filter, label: f.filter })),
              ]}
            />
          )}
        </form>
      </div>
    </Modal>
  );
};

export default PromptModal;
