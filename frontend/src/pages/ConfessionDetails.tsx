import {
  Card, CardContent, CardHeader, Container, Divider,
  Link, List, ListItem, ListItemText, Grid,
} from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';
import React, { useEffect, useState } from 'react';
import ActionButtons from '../components/ActionButtons';
import HTTPClient from '../service/HTTPClient';

export default function (props: RouteComponentProps & {id?: string}) {
  const { id } = props;
  const [confession, setConfession] = useState<any>({});
  useEffect(() => {
    HTTPClient.get(`/confessions/confession/${id}`).then(async (res) => {
      const response = await res.json();
      if (response.success) {
        setConfession(response.data);
      }
    });
  }, [id]);
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
      <Card>
        <CardHeader
          title={id}
          subheader={confession.createdAt}
          action={confession.entryID && (
            <Grid container alignItems="center">
              <Grid item>
                <Link href={`https://wykop.pl/wpis/${confession.entryID}`} target="_blank" rel="noreferrer">
                  {confession.entryID}
                </Link>
              </Grid>
              <Grid item>
                <ActionButtons
                  confession={confession}
                  acceptFn={() => Promise.resolve(undefined)}
                  setStatusFn={() => Promise.resolve(undefined)}
                  deleteFn={() => Promise.resolve(undefined)}
                />
              </Grid>
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
    </Container>
  );
}
