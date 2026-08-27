import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal, ModalFooter, TextField } from '@folio/stripes/components';

// Edit the human-readable title of an existing list. The list's name is not
// editable -- CCMS has no facility for renaming a set -- so it is shown as
// read-only context for the title that is being changed.
const EditListModal = ({
  heading,
  open,
  name,
  title,
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(title || '');

  // The modal stays mounted when closed, so re-seed from the list's present
  // title whenever it is opened -- otherwise an abandoned edit is still there
  // next time, and a title arriving after the first render is never shown.
  useEffect(() => {
    if (open) setValue(title || '');
  }, [open, title]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(value);
  };

  const footer = (
    <ModalFooter>
      <Button buttonStyle="primary" disabled={value === (title || '')} onClick={handleSubmit}>
        <FormattedMessage id="stripes-components.submit" />
      </Button>
      <Button buttonStyle="default" onClick={onCancel}>
        <FormattedMessage id="stripes-components.cancel" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      open={open}
      onClose={onCancel}
      label={heading}
      scope="module"
      size="small"
      footer={footer}
    >
      <form onSubmit={handleSubmit}>
        <TextField
          label={<FormattedMessage id="ui-cyclops.list.edit.name.label" />}
          value={name || ''}
          disabled
        />
        <TextField
          autoFocus
          label={<FormattedMessage id="ui-cyclops.list.edit.title.label" />}
          name="title"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </form>
    </Modal>
  );
};

export default EditListModal;
