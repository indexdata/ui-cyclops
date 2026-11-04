import React from 'react';
import PropTypes from 'prop-types';
import { useIntl, FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import { Row, Col, TextField, InfoPopover } from '@folio/stripes/components';
import ListField from './ListField';

function translationTagAndHelpButton(intl, domain, tag, i18nTag, helpTag) {
  const translationTag = `ui-cyclops.${domain}.field.${i18nTag || tag}`;
  const helpTranslationTag = `ui-cyclops.${domain}.field.${helpTag || i18nTag || tag}.help`;
  const helpMessage = intl.messages[helpTranslationTag];
  const helpButton =
    !helpMessage ?
      undefined :
      <InfoPopover content={<FormattedMessage id={helpTranslationTag} />} />;

  return [translationTag, helpButton];
}

// Col-Field
export const CF = ({ domain = 'project', tag, i18nTag, helpTag, xs, ...rest }) => {
  const intl = useIntl();
  const [translationTag, helpButton] = translationTagAndHelpButton(intl, domain, tag, i18nTag, helpTag);

  return (
    <Col xs={xs}>
      <Field
        id={`edit-${domain}-${tag}`}
        name={tag}
        label={<><FormattedMessage id={translationTag} /> {helpButton}</>}
        component={TextField}
        {...rest}
      />
    </Col>
  );
};

CF.propTypes = {
  tag: PropTypes.string.isRequired,
  domain: PropTypes.string, // if defined, use instead of "channels"
  i18nTag: PropTypes.string, // if defined, use this translation tag instead of `tag`
  helpTag: PropTypes.string, // if defined, use this translation tag to find help text
  xs: PropTypes.number.isRequired,
};

// Row-Col-Field
export const RCF = (props) => (
  <Row>
    <CF {...props} xs={12} />
  </Row>
);

// Col-ListField
export const CLF = ({ domain = 'project', tag, i18nTag, helpTag, xs, ...rest }) => {
  const intl = useIntl();
  const [translationTag, helpButton] = translationTagAndHelpButton(intl, domain, tag, i18nTag, helpTag);

  return (
    <Col xs={xs}>
      <ListField
        id={`edit-${domain}-${tag}`}
        name={tag}
        label={<><FormattedMessage id={translationTag} /> {helpButton}</>}
        entryLabel={intl.formatMessage({ id: translationTag })}
        {...rest}
      />
    </Col>
  );
};

CLF.propTypes = CF.propTypes;

// Row-Col-ListField
export const RCLF = (props) => (
  <Row>
    <CLF {...props} xs={12} />
  </Row>
);
