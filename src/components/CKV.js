import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { FormattedMessage } from 'react-intl';
import { Row, Col, KeyValue } from '@folio/stripes/components';

export const CKV = ({ rec, tag, i18nTag, xs, formatFn = x => x }) => {
  let value = get(rec, tag);
  if (value === true) {
    value = '✅';
  } else if (value === false) {
    value = '❌';
  }

  if (formatFn) {
    value = formatFn(value);
  }

  return (
    <Col xs={xs}>
      <KeyValue label={<FormattedMessage id={`ui-cyclops.project.field.${i18nTag || tag}`} />} value={value} />
    </Col>
  );
};

CKV.propTypes = {
  rec: PropTypes.object.isRequired,
  tag: PropTypes.string.isRequired,
  i18nTag: PropTypes.string, // if defined, use this translation tag instead of `tag`
  xs: PropTypes.number.isRequired,
};

export const RCKV = (props) => (
  <Row>
    <CKV {...props} xs={12} />
  </Row>
);
