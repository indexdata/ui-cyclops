import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Pane, Paneset, Icon, MultiColumnList, Row, Col, KeyValue } from '@folio/stripes/components';
import { useNav } from '../NavContext';
import { RCKV, CKV } from '../components/CKV';
import packageInfo from '../../package';


function renderProject(baseProject) {
  const project = {
    ...baseProject,

    // Dummy data until we can get the real stuff from CCMS
    people: [
      {
        name: 'Boaz (Lehigh)',
        role: 'Admin',
      },
      {
        name: 'Sebastian (Index Data)',
        role: 'Visionary',
      },
    ],
    locations: [
      {
        name: 'Lehigh',
      },
      {
        name: 'NYU',
      },
      {
        name: 'CLOCKSS',
      },
    ],
    tracks: [
      {
        name: 'Offsite',
      },
      {
        name: 'Reserve',
      },
      {
        name: 'Stacks',
      },
    ],
  };

  return (
    <>
      <Row>
        <CKV rec={project} tag="title" xs={6} />
        <CKV rec={project} tag="altName" xs={3} formatFn={x => <code>{x}</code>} />
        <CKV rec={project} tag="action" xs={3} formatFn={(value) => value.name} />
      </Row>
      <RCKV rec={project} tag="mou_link" formatFn={x => <a target="_blank" rel="noreferrer" href={x}>{x}</a>} />
      <Row>
        <CKV
          rec={project}
          tag="funds"
          xs={6}
          formatFn={(entries) => (
            <ul>
              {entries.split('|').map(entry => (
                <li>
                  <code>{entry.replace(/:.*/, '')}</code>
                  &nbsp;
                  ({entry.replace(/.*?:/, '')})
                </li>
              ))}
            </ul>
          )}
        />
        <CKV
          xs={6}
          rec={project}
          tag="people"
          formatFn={
            x => (
              <ul>
                {x.map(y => <li>{y.name}: {y.role}</li>)}
              </ul>
            )
          }
        />
      </Row>
      <Row>
        <Col xs={6}>
          <KeyValue label={<FormattedMessage id="ui-cyclops.project.field.locations" />}>
            <ul>
              {project.locations.map(x => <li>{x.name}</li>)}
            </ul>
          </KeyValue>
        </Col>
        <Col xs={6}>
          <KeyValue label={<FormattedMessage id="ui-cyclops.project.field.tracks" />}>
            <ul>
              {project.tracks.map(x => <li>{x.name}</li>)}
            </ul>
          </KeyValue>
        </Col>
      </Row>
    </>
  );
}


function renderList(sets, nav) {
  const contentData = sets.sets.map(name => ({ name }));

  /* eslint-disable jsx-a11y/anchor-is-valid */
  return (
    <>
      <div />{/* For some reason, if we omit this the MCL does not render */}
      <MultiColumnList
        columnMapping={{
          name: <FormattedMessage id="ui-cyclops.field.name" />,
        }}
        contentData={contentData}
        formatter={{
          name: r => <Link to={`${packageInfo.stripes.route}/list/${nav.project.altName}/${r.name}`}>{r.name}</Link>,
        }}
      />
    </>
  );
}


export default function ProjectView({ loaded, project, sets }) {
  const nav = useNav();
  nav.update({ project: { ...project, location: useLocation() } });

  const paneTitle = <FormattedMessage
    id="ui-cyclops.project.header"
    values={{
      count: sets?.sets.length,
      project: nav.project.name,
    }}
  />;

  return (
    <Paneset static>
      <Pane defaultWidth="20%" paneTitle="">
        {/* Nothing to go here, unless we want an "About" text or something */}
      </Pane>
      <Pane defaultWidth="80%" paneTitle={paneTitle}>
        {!loaded
          ? <Icon icon="spinner-ellipsis" />
          : (
            <>
              {renderProject(project)}
              {renderList(sets, nav)}
            </>
          )
        }
      </Pane>
    </Paneset>
  );
}
