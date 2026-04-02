import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Pane, LoadingPane, IconButton, Row, Col, KeyValue } from '@folio/stripes/components';
import packageInfo from '../../package';
import css from './SpectreView.css';

function SpectreRoute({ loaded, match, spectre }) {
  if (!loaded) return <LoadingPane />;

  const listUrl = `${packageInfo.stripes.route}/list/${match.params.projectId}/${match.params.setId}`;

  return (
    <Pane
      defaultWidth="40%"
      paneTitle={spectre.title}
      firstMenu={<IconButton icon="times" to={listUrl} />}
    >
      <Row>
        <Col xs={6} className={css.miniPane}>
          <h4>About</h4>
          <KeyValue label={<FormattedMessage id="ui-cyclops.field.title" />} value={spectre.title} />
          <KeyValue label={<FormattedMessage id="ui-cyclops.field.author" />} value={spectre.author} />
          <KeyValue label={<FormattedMessage id="ui-cyclops.field.full_vendor_name" />} value={spectre.vendor} />
          <KeyValue label={<FormattedMessage id="ui-cyclops.field.availability" />} value={spectre.availability} />
        </Col>
        <Col xs={6} className={css.miniPane}>
          <h4>Media</h4>
          <i>I have no idea what we can put here.</i>
        </Col>
      </Row>
      <Row>
        <Col xs={6} className={css.miniPane}>
          <h4>Identifiers</h4>
          <i>Not yet available.</i>
        </Col>
        <Col xs={6} className={css.miniPane}>
          <h4>BISAC categories</h4>
          <i>Not yet available.</i>
        </Col>
      </Row>
      <Row>
        <Col xs={6} className={css.miniPane}>
          <h4>Review citations</h4>
          <i>Not yet available.</i>
        </Col>
        <Col xs={6} className={css.miniPane}>
          <h4>Holdings</h4>
          <i>Not yet available.</i>
        </Col>
      </Row>
      <Row>
        <Col xs={12} className={css.miniPane}>
          <h4>In lists</h4>
          <i>CCMS does not yet provide a means to discover this.</i>
        </Col>
      </Row>

      <Row>
        <Col xs={12} className={css.miniPane}>
          <h4>Actions</h4>
          <i>To follow...</i>
        </Col>
      </Row>
    </Pane>
  );
}

export default SpectreRoute;
