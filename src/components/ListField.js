import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { TextField, Label, IconButton, Button } from '@folio/stripes/components';
import css from './ListField.css';


// The visible label heads the whole list, so it labels none of the inputs:
// each entry gets its own accessible name instead, built from `entryLabel`
// (a plain string, as aria-label must be) and the entry's position.
// `renderEntry` receives that name and should pass it to its field.
const ListField = ({ name, label, entryLabel, renderEntry, component, emptyValue }) => {
  const intl = useIntl();
  const entryAriaLabel = (index) => intl.formatMessage(
    { id: 'ui-cyclops.list-field.entry.aria-label' },
    { label: entryLabel, number: index + 1 },
  );

  return (
    <>
      {label && <Label>{label}</Label>}
      <FieldArray name={name}>
        {({ fields }) => (
          <>
            {fields.map((subname, index) => (
              <div key={subname} className={css.row}>
                <div className={css.field}>
                  {renderEntry ?
                    renderEntry(subname, entryAriaLabel(index)) :
                    <Field name={subname} component={component || TextField} aria-label={entryAriaLabel(index)} />
                  }
                </div>
                <div>
                  <IconButton
                    icon="trash"
                    onClick={() => fields.remove(index)}
                    aria-label={intl.formatMessage({ id: 'ui-cyclops.list-field.remove.aria-label' }, { label: entryLabel, number: index + 1 })}
                  />
                </div>
              </div>
            ))}
            <Button onClick={() => fields.push(emptyValue || '')}>
              <FormattedMessage id="ui-cyclops.button.add" />
            </Button>
          </>
        )}
      </FieldArray>
    </>
  );
};

ListField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  entryLabel: PropTypes.string.isRequired,
  renderEntry: PropTypes.func,
  component: PropTypes.elementType,
  emptyValue: PropTypes.any, // eslint-disable-line react/forbid-prop-types
};

export default ListField;
