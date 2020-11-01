import {
  Card, CardContent, Container, Divider,
  Link, Grid, Box,
  LinearProgress, Typography, makeStyles, createStyles, Theme,
} from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';
import React, { useContext, useEffect, useState } from 'react';
import ActionButtons from '../components/ActionButtons';

import StyledCardHeader from '../components/StyledCardHeader';
import Action from '../components/Action';
import EditTagsDialog from '../components/EditTagsDialog';
import { toggleStatus } from '../utils';
import { APIContext } from '../App';

const useStyles = makeStyles((theme: Theme) => createStyles({
  cardContentHeader: {
    marginBottom: theme.spacing(2),
  },
}));

export default function (props: RouteComponentProps & {id?: string}) {
  const { id } = props;
  const [confession, setConfession] = useState<any>(undefined);
  const [editTagsDialog, setEditTagsDialog] = useState<boolean>(false);
  const { httpClient, apiClient } = useContext(APIContext);
  useEffect(() => {
    httpClient.swallow(httpClient.get(`/confessions/confession/${id}`))
      .then(async (fetchedConfessions) => {
        setConfession(fetchedConfessions);
      });
  }, [id, httpClient]);

  const patchConfession = (response) => {
    const updatedConfession = { ...confession, ...response.patchObject };
    const { action } = response;
    if (action) updatedConfession.actions.unshift(action);
    setConfession(updatedConfession);
  };

  const addEntryFn = () => apiClient.confessions.add(confession).then(async (response) => {
    patchConfession(response);
    return response;
  });

  const setStatusFn = (confession2: any, note?: string) =>
    apiClient.confessions.setStatus(confession2, { status: toggleStatus(confession2.status), note })
      .then((response) => {
        patchConfession(response);
        return response;
      });

  const deleteEntryFn = () => apiClient.confessions.delete(confession).then(async (response) => {
    patchConfession(response);
    return response;
  });

  const actionsList = confession?.actions
  ?.map((action, i) =>
    <Action action={action} index={confession.actions.length - 1 - i} key={action._id} />);

  const classes = useStyles();

  return (
    <Container>
      {(confession ? (
        <Card>
          <EditTagsDialog
            confession={confession}
            tags={confession.tags}
            open={editTagsDialog}
            onClose={() => setEditTagsDialog(false)}
            patchConfession={patchConfession}
          />
          <StyledCardHeader
            title={id}
            subheader={(
              <Grid container>
                <Box>
                  {confession.createdAt}
                </Box>
                <Box mx={2} onClick={() => setEditTagsDialog(true)}>
                  <Typography color="primary">
                    #
                  </Typography>
                </Box>
              </Grid>
)}
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
                    model={confession}
                    acceptFn={addEntryFn}
                    setStatusFn={setStatusFn}
                    deleteFn={deleteEntryFn}
                  />
                </Box>
              </Grid>
          )}
          />
          <CardContent>
            <div>
              {confession.text}
            </div>
          </CardContent>
          <Divider variant="middle" />
          <CardContent>
            <Typography variant="h5" className={classes.cardContentHeader}>
              Actions:
            </Typography>
            {actionsList}
          </CardContent>
        </Card>
      ) : <LinearProgress />)}
    </Container>
  );
}
