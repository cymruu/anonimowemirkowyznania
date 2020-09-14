import {
  Card, CardContent, Container, Divider,
  Link, List, ListItem, ListItemText, Grid, Box,
  LinearProgress,
} from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';
import React, { useEffect, useState } from 'react';
import ActionButtons from '../components/ActionButtons';
import HTTPClient from '../service/HTTPClient';
import { ApiAddEntry } from '../service/api';
import StyledCardHeader from '../components/StyledCardHeader';

export default function (props: RouteComponentProps & {id?: string}) {
  const { id } = props;
  const [confession, setConfession] = useState<any>(undefined);
  useEffect(() => {
    HTTPClient.get(`/confessions/confession/${id}`).then(async (res) => {
      const response = await res.json();
      if (response.success) {
        setConfession(response.data);
      }
    });
  }, [id]);

  const addEntryFn = () => ApiAddEntry(confession).then(async (res) => {
    const response = await res.json();
    if (response.success) {
      setConfession({ ...confession, ...response.data.patchObject });
    }
  });

  const actionsList = confession?.actions?.map(({
    _id, action, time, user,
  }, index) => {
    let secondaryText = `${time}`;
    if (user) {
      secondaryText += ` ${user.username}`;
    }
    return (
      <ListItem key={_id}>
        <ListItemText primary={`${index + 1}: ${action}`} secondary={secondaryText} />
      </ListItem>
    );
  });

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
                    setStatusFn={() => Promise.resolve(undefined)}
                    deleteFn={() => Promise.resolve(undefined)}
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
