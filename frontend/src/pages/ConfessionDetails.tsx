import {
  Card, CardContent, Container, Divider,
  Link, List, Grid, Box,
  LinearProgress,
} from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';
import React, { useEffect, useState } from 'react';
import ActionButtons from '../components/ActionButtons';
import HTTPClient from '../service/HTTPClient';
import { ApiAddEntry, ApiDeleteEntry } from '../service/api';
import StyledCardHeader from '../components/StyledCardHeader';
import { toggleConfessionStatus } from './Confessions';
import Action from '../components/Action';

export default function (props: RouteComponentProps & {id?: string}) {
  const { id } = props;
  const [confession, setConfession] = useState<any>(undefined);
  useEffect(() => {
    HTTPClient.get(`/confessions/confession/${id}`).then(async (res) => {
      const response = await res.json();
      if (response.success) {
        setConfession(response.data);
      }
    }).catch((err) => {
      console.log(err);
    });
  }, [id]);

  const patchConfession = (response) => {
    const updatedConfession = { ...confession, ...response.data.patchObject };
    const { action } = response.data;
    if (action) updatedConfession.actions.unshift(action);
    setConfession(updatedConfession);
  };

  const addEntryFn = () => ApiAddEntry(confession).then(async (res) => {
    const response = await res.json();
    if (response.success) {
      patchConfession(response);
    }
    return response;
  });
  const setStatusFn = (confession2: any, note?: string) => toggleConfessionStatus(confession2, note)
    .then((response) => {
      if (response.success) {
        patchConfession(response);
      }
      return response;
    });
  const deleteEntryFn = () => ApiDeleteEntry(confession).then(async (res) => {
    const response = await res.json();
    if (response.success) {
      patchConfession(response);
    }
    return response;
  });

  const actionsList = confession?.actions?.map((action, i) => <Action action={action} index={confession.actions.length - i} />);

  return (
    <Container>
      {(confession ? (
        <Card>
          <StyledCardHeader
            title={id}
            subheader={confession.createdAt}
            status={confession.status}
            action={(
              <Grid container alignItems="center">
                { confession.entryID && (
                <Box mx={1}>
                  <Link href={`https://wykop.pl/wpis/${confession.entryID}`} target="_blank" rel="noreferrer">
                    {confession.entryID}
                  </Link>
                </Box>
                )}
                <Box>
                  <ActionButtons
                    confession={confession}
                    acceptFn={addEntryFn}
                    setStatusFn={setStatusFn}
                    deleteFn={deleteEntryFn}
                  />
                </Box>
              </Grid>
          )}
          />
          <Divider variant="middle" />
          <CardContent>
            <div>
              {confession.text}
            </div>
          </CardContent>
          <Divider variant="middle" />
          <CardContent>
            <List dense>
              {actionsList}
            </List>
          </CardContent>
        </Card>
      ) : <LinearProgress />)}
    </Container>
  );
}
