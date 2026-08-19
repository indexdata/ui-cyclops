import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useCallout } from '@folio/stripes/core';
import { Pane, LoadingPane, IconButton, Row, Col, Headline, KeyValue } from '@folio/stripes/components';
import ActionSection from './ActionSection';
import css from './SpectreView.css';
import packageInfo from '../../package';

function SpectreView({ loaded, match, project, spectre, funds, mutator }) {
  const callout = useCallout();

  if (!loaded) return <LoadingPane />;

  const listUrl = `${packageInfo.stripes.route}/list/${match.params.projectId}/${match.params.setId}`;

  const decide = async (payload, messageId, values = {}) => {
    try {
      await mutator.spectreUpdate.POST({ decision: spectre.decision, fund: spectre.fund?.replace(/:.*/, ''), ...payload });
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
  const onDecide = () => decide({ decision: true }, 'ui-cyclops.spectre.decision');
  return (
    <Pane
      defaultWidth="40%"
      paneTitle={spectre.title}
      firstMenu={<IconButton icon="times" to={listUrl} />}
    >
      <Row>
        <Col xs={6} className={css.miniPane}>
          <Headline tag="h3">About</Headline>
          <KeyValue label={<FormattedMessage id="ui-cyclops.field.title" />} value={spectre.title} />
          <KeyValue label={<FormattedMessage id="ui-cyclops.field.author" />} value={spectre.author} />
          <KeyValue label={<FormattedMessage id="ui-cyclops.field.full_vendor_name" />} value={spectre.vendor} />
          <KeyValue label={<FormattedMessage id="ui-cyclops.field.availability" />} value={spectre.availability} />
        </Col>
        <Col xs={6} className={css.miniPane}>
          <Headline tag="h3">Media</Headline>
          <i>I have no idea what we can put here.</i>
        </Col>
      </Row>
      <Row>
        <Col xs={6} className={css.miniPane}>
          <Headline tag="h3">Identifiers</Headline>
          <i>Not yet available.</i>
        </Col>
        <Col xs={6} className={css.miniPane}>
          <Headline tag="h3">BISAC categories</Headline>
          <i>Not yet available.</i>
        </Col>
      </Row>
      <Row>
        <Col xs={6} className={css.miniPane}>
          <Headline tag="h3">Review citations</Headline>
          <i>Not yet available.</i>
        </Col>
        <Col xs={6} className={css.miniPane}>
          <Headline tag="h3">Holdings</Headline>
          <i>Not yet available.</i>
        </Col>
      </Row>
      <Row>
        <Col xs={12} className={css.miniPane}>
          <Headline tag="h3">In lists</Headline>
          <i>CCMS does not yet provide a means to discover this.</i>
        </Col>
      </Row>

      <Row>
        <Col xs={12} className={css.miniPane}>
          <Headline tag="h3">Actions</Headline>
          <ActionSection
            key={match.params.spectreId}
            project={project}
            spectre={spectre}
            funds={funds}
            onChangeFund={onChangeFund}
            onDecide={onDecide}
          />
        </Col>
      </Row>
    </Pane>
  );
}

export default SpectreView;
