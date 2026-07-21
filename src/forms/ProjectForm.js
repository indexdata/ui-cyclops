import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { TitleManager } from '@folio/stripes/core';
import { Pane, Paneset, Icon, Row, Col, KeyValue, Select, Button, PaneFooter } from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';
import { CKV } from '../components/CKV';
import { CF, RCF, CLF } from '../components/CF';


function renderPaneFooter(handleSubmit, onCancel, pristine, submitting) {
  return (
    <PaneFooter
      renderStart={(
        <Button
          buttonStyle="default mega"
          id="clickable-cancel"
          marginBottom0
          onClick={onCancel}
        >
          <FormattedMessage id="stripes-components.cancel" />
        </Button>
      )}
      renderEnd={(
        <Button
          buttonStyle="primary mega"
          disabled={pristine || submitting}
          id="clickable-update-harvestable"
          marginBottom0
          onClick={handleSubmit}
          type="submit"
        >
          <FormattedMessage id="stripes-components.saveAndClose" />
        </Button>
      )}
    />
  );
}


function validate(values) {
  const errors = {};
  const requiredTextMessage = <FormattedMessage id="ui-cyclops.fillIn" />;

  ['id', 'name'].forEach(fieldName => {
    if (!values[fieldName]) {
      errors[fieldName] = requiredTextMessage;
    }
  });

  if (!values.action?.id) {
    errors.action = { id: requiredTextMessage };
  }

  return errors;
}


const ACTION_NAMES = ['acquire', 'retire', 'digitize', 'move', 'other'];

const LOCATION_OPTIONS = [
  { value: 'clockss', label: 'CLOCKSS' },
  { value: 'lehigh', label: 'LeHigh' },
  { value: 'nyu', label: 'New York University' },
];

function ProjectForm({ loaded, project, initialValues, handleSubmit, onClose, pristine, submitting, funds = [] }) {
  const name = initialValues?.name;
  const fundOptions = funds.map(f => ({ value: f.id, label: f.name }));
  const actionOptions = [
    // Leading empty option so the dropdown reads as empty until a value is
    // chosen, rather than defaulting to displaying the first action name.
    { value: '', label: '' },
    ...ACTION_NAMES.map(name => ({ value: name, label: name.charAt(0).toUpperCase() + name.slice(1) })),
  ];
  const paneTitle = initialValues?.id
    ? <FormattedMessage id="ui-cyclops.project.edit" values={{ project: name }} />
    : <FormattedMessage id="ui-cyclops.project.new" />;

  return (
    <Paneset static>
      <Pane defaultWidth="20%" paneTitle="">
        {/* Nothing to go here, unless we want an "About" text or something */}
      </Pane>
      <Pane
        defaultWidth="80%"
        paneTitle={paneTitle}
        footer={renderPaneFooter(handleSubmit, onClose, pristine, submitting)}
      >
        {!loaded
          ? <Icon icon="spinner-ellipsis" />
          : (
            <TitleManager record={name}>
              <form>
                <Row>
                  <CF tag="name" xs={6} />
                  <CF tag="id" xs={3} />
                  <CF tag="action.id" i18nTag="action" xs={3} component={Select} dataOptions={actionOptions} />
                </Row>
                <RCF tag="mou_link" />
                <Row>
                  <CLF
                    tag="funds"
                    xs={6}
                    emptyValue={{ id: '' }}
                    renderEntry={subname => (
                      <Field
                        name={`${subname}.id`}
                        component={Select}
                        dataOptions={fundOptions}
                        placeholder="Select fund"
                      />
                    )}
                  />
                  <CKV
                    xs={6}
                    rec={project}
                    tag="people"
                    formatFn={
                      x => (
                        <ul>
                          {x?.map(y => <li key={y.name}>{y.name}: {y.role}</li>)}
                        </ul>
                      )
                    }
                  />
                </Row>
                <Row>
                  <CLF
                    tag="origins"
                    xs={6}
                    emptyValue={{ id: '' }}
                    renderEntry={subname => (
                      <Field
                        name={`${subname}.id`}
                        component={Select}
                        dataOptions={LOCATION_OPTIONS}
                        placeholder="Select location"
                      />
                    )}
                  />
                  <CLF
                    tag="destinations"
                    xs={6}
                    emptyValue={{ id: '' }}
                    renderEntry={subname => (
                      <Field
                        name={`${subname}.id`}
                        component={Select}
                        dataOptions={LOCATION_OPTIONS}
                        placeholder="Select location"
                      />
                    )}
                  />
                </Row>
                <Row>
                  <Col xs={6}>
                    <KeyValue label={<FormattedMessage id="ui-cyclops.project.field.tracks" />}>
                      <ul>
                        {/* project.tracks?.map(x => <li key={x.name}>{x.name}</li>) */}
                      </ul>
                    </KeyValue>
                  </Col>
                </Row>
              </form>
            </TitleManager>
          )
        }
      </Pane>
    </Paneset>
  );
}


export default stripesFinalForm({
  // initialValuesEqual: (a, b) => isEqual(a, b),
  validate,
  navigationCheck: true,
  mutators: {
    ...arrayMutators,
  },
  subscription: {
    values: true,
  },
})(ProjectForm);
