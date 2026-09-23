import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useCallout } from '@folio/stripes/core';
import { Pane, LoadingPane, IconButton, Row, Col, Headline, KeyValue } from '@folio/stripes/components';
import ActionSection from './ActionSection';
import css from './SpectreView.css';
import packageInfo from '../../package';

function SpectreView({ loaded, match, project, spectre, mutator }) {
  const callout = useCallout();

  if (!loaded) return <LoadingPane />;

  const listUrl = `${packageInfo.stripes.route}/list/${match.params.projectId}/${match.params.setId}`;

  const decide = async (payload, messageId, values = {}) => {
    try {
      // Every update sends the whole record, so the values that are not being
      // changed are sent along as they stand.
      await mutator.spectreUpdate.POST({
        decision: spectre.decision,
        fund: spectre.fund?.replace(/:.*/, ''),
        track: spectre.track?.replace(/:.*/, ''),
        ...payload,
      });
      callout.sendCallout({
        message: <FormattedMessage id={`${messageId}.success`} values={values} />,
      });
    } catch (res) {
      callout.sendCallout({
        type: 'error',
        timeout: 0,
        message: <FormattedMessage
          id={`${messageId}.failure`}
          values={{
            ...values,
            status: res.status,
            statusText: res.statusText,
            body: await res.text(),
          }}
        />
      });
    }
  };

  const onChangeFund = (fund) => decide({ fund }, 'ui-cyclops.spectre.set-fund', { fund });
  const onChangeTrack = (track) => decide({ track }, 'ui-cyclops.spectre.set-track', { track });
  const onDecide = () => decide({ decision: true }, 'ui-cyclops.spectre.decision');
  return (
    <Pane
      defaultWidth="40%"
      paneTitle={spectre.title}
      firstMenu={<IconButton icon="times" to={listUrl} />}
    >
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
