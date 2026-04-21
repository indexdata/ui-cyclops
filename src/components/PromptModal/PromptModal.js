import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal, ModalFooter } from '@folio/stripes/components';

const PromptModal = ({
  heading,
  onConfirm,
  onCancel,
  open,
  message,
}) => {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = inputRef.current.value;
    if (value) onConfirm(value);
  };

  const footer = (
    <ModalFooter>
      <Button buttonStyle="primary" onClick={handleSubmit}>
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
      <p>
        {message}
      </p>
      <div>
        <form onSubmit={handleSubmit}>
          <input style={{ width: '100%', boxSizing: 'border-box' }} name="value" ref={inputRef} type="text" />
        </form>
      </div>
    </Modal>
  );
};

export default PromptModal;
