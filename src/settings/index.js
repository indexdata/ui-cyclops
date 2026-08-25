import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Paneset } from '@folio/stripes/components';
import { Settings } from '@folio/stripes/smart-components';
import FilterSettings from './FilterSettings';
import FundSettings from './FundSettings';

export default class CyclopsSettings extends React.Component {
  pages = [
    {
      route: 'filters',
      label: <FormattedMessage id="ui-cyclops.settings.filters" />,
      component: FilterSettings,
    },
    {
      route: 'funds',
      label: <FormattedMessage id="ui-cyclops.settings.funds" />,
      component: FundSettings,
    },
  ];

  render() {
    // Wrap Settings in a Paneset so there is always a PanesetContext ancestor.
    // Settings itself renders only a bare <Pane> + <Switch>, so a settings page
    // that renders its own <Paneset> (e.g. ControlledVocab on the Funds page)
    // has nothing to nest into and promotes itself to a screen-filling root.
    // The `nested` prop keeps this wrapping Paneset position:relative so it sits
    // within the settings module area (rather than position:absolute filling the
    // viewport and hiding the top-level Settings nav), while still providing the
    // context that lets the Funds paneset nest as the right-hand pane.
    return (
      <Paneset nested>
        <Settings
          {...this.props}
          pages={this.pages}
          paneTitle={<FormattedMessage id="ui-cyclops.meta.title" />}
        />
      </Paneset>
    );
  }
}
