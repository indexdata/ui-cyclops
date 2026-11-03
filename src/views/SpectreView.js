import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useCallout } from '@folio/stripes/core';
import XMLViewer from 'react-xml-viewer';
import { Pane, LoadingPane, IconButton, Row, Col, Headline, KeyValue, Button, Icon, Modal } from '@folio/stripes/components';
import ActionSection from './ActionSection';
import { mutateWithCallout } from '../util';
import css from './SpectreView.css';
import packageInfo from '../../package';

function SpectreView({ loaded, match, project, spectre, mutator }) {
  const callout = useCallout();
  const [showSourceRecord, setShowSourceRecord] = useState(false);

  if (!loaded) return <LoadingPane />;

  const listUrl = `${packageInfo.stripes.route}/list/${match.params.projectId}/${match.params.setId}`;

  // Every update sends the whole record, so the values that are not being
  // changed are sent along as they stand.
  const decide = (payload, messageId, values = {}) => mutateWithCallout(callout, () => (
    mutator.spectreUpdate.POST({
      decision: spectre.decision,
      fund: spectre.fund?.replace(/:.*/, ''),
      track: spectre.track?.replace(/:.*/, ''),
      ...payload,
    })
  ), {
    values,
    successId: `${messageId}.success`,
    failureId: `${messageId}.failure`,
  });

  const onChangeFund = (fund) => decide({ fund }, 'ui-cyclops.spectre.set-fund', { fund });
  const onChangeTrack = (track) => decide({ track }, 'ui-cyclops.spectre.set-track', { track });
  const onDecide = () => decide({ decision: true }, 'ui-cyclops.spectre.decision');

  const renderActionMenu = ({ onToggle }) => (
    <Button
      buttonStyle="dropdownItem"
      onClick={() => { onToggle(); setShowSourceRecord(true); }}
    >
      <Icon icon="report">
        <FormattedMessage id="ui-cyclops.spectre.view-source-record" />
      </Icon>
    </Button>
  );

  return (
    <Pane
      defaultWidth="40%"
      paneTitle={spectre.title}
      firstMenu={<IconButton icon="times" to={listUrl} />}
      actionMenu={renderActionMenu}
    >
      <Modal
        open={showSourceRecord}
        onClose={() => setShowSourceRecord(false)}
        dismissible
        closeOnBackgroundClick
        size="large"
        label={<FormattedMessage id="ui-cyclops.spectre.source-record.heading" />}
      >
        <XMLViewer
          xml={spectre.source_record || ''}
          collapsible
          invalidXml={<pre className={css.sourceRecord}>{spectre.source_record}</pre>}
        />
      </Modal>
      <Row>
        <Col xs={6} className={css.miniPane}>
          <Headline tag="h3"><FormattedMessage id="ui-cyclops.spectre.about.heading" /></Headline>
          <KeyValue label={<FormattedMessage id="ui-cyclops.field.title" />} value={spectre.title} />
          <KeyValue label={<FormattedMessage id="ui-cyclops.field.author" />} value={spectre.author} />
          <KeyValue label={<FormattedMessage id="ui-cyclops.field.full_vendor_name" />} value={spectre.vendor} />
          <KeyValue label={<FormattedMessage id="ui-cyclops.field.availability" />} value={spectre.availability} />
        </Col>
        <Col xs={6} className={css.miniPane}>
          <Headline tag="h3"><FormattedMessage id="ui-cyclops.spectre.media.heading" /></Headline>
          <i><FormattedMessage id="ui-cyclops.spectre.not-yet-available" /></i>
        </Col>
      </Row>
      <Row>
        <Col xs={6} className={css.miniPane}>
          <Headline tag="h3"><FormattedMessage id="ui-cyclops.spectre.identifiers.heading" /></Headline>
          <i><FormattedMessage id="ui-cyclops.spectre.not-yet-available" /></i>
        </Col>
        <Col xs={6} className={css.miniPane}>
          <Headline tag="h3"><FormattedMessage id="ui-cyclops.spectre.bisac.heading" /></Headline>
          <i><FormattedMessage id="ui-cyclops.spectre.not-yet-available" /></i>
        </Col>
      </Row>
      <Row>
        <Col xs={6} className={css.miniPane}>
          <Headline tag="h3"><FormattedMessage id="ui-cyclops.spectre.reviews.heading" /></Headline>
          <i><FormattedMessage id="ui-cyclops.spectre.not-yet-available" /></i>
        </Col>
        <Col xs={6} className={css.miniPane}>
          <Headline tag="h3"><FormattedMessage id="ui-cyclops.spectre.holdings.heading" values={{ count: spectre.holdings_count }} /></Headline>
          <ul className={css.noDecoration}>
            <li><FormattedMessage id="ui-cyclops.spectre.holdings.library" values={{ count: spectre.library_holdings_count }} /></li>
            <li><FormattedMessage id="ui-cyclops.spectre.holdings.online-database" values={{ count: spectre.online_database_holdings_count }} /></li>
            <li><FormattedMessage id="ui-cyclops.spectre.holdings.vendor" values={{ count: spectre.vendor_holdings_count }} /></li>
          </ul>
        </Col>
      </Row>
      <Row>
        <Col xs={12} className={css.miniPane}>
          <Headline tag="h3"><FormattedMessage id="ui-cyclops.spectre.lists.heading" /></Headline>
          <i><FormattedMessage id="ui-cyclops.spectre.lists.unavailable" /></i>
        </Col>
      </Row>

      <Row>
        <Col xs={12} className={css.miniPane}>
          <Headline tag="h3"><FormattedMessage id="ui-cyclops.spectre.actions.heading" /></Headline>
          <ActionSection
            key={match.params.spectreId}
            project={project}
            spectre={spectre}
            onChangeFund={onChangeFund}
            onChangeTrack={onChangeTrack}
            onDecide={onDecide}
          />
        </Col>
      </Row>
    </Pane>
  );
}

export default SpectreView;
