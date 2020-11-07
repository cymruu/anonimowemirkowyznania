import {
  Box, Card, CardContent, Container, Divider,
  Grid,
  LinearProgress, Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core';
import EmbedIcon from '@material-ui/icons/Attachment';
import SurveyIcon from '@material-ui/icons/Poll';
import RadioIcon from '@material-ui/icons/RadioButtonUnchecked';
import { RouteComponentProps } from '@reach/router';
import React, { useContext, useEffect, useState } from 'react';
import { APIContext } from '../App';
import Action from '../components/Action';
import ActionButtons from '../components/ActionButtons';
import EditTagsDialog from '../components/EditTagsDialog';
import StyledCardHeader from '../components/StyledCardHeader';
import ViewIPDialog from '../components/ViewIPDialog';
import { noOpFn, toggleStatus } from '../utils';

export default function (props: RouteComponentProps & {id?: string}) {
  const { id } = props;
  const [confession, setConfession] = useState<any>(undefined);
  const [editTagsDialog, setEditTagsDialog] = useState<boolean>(false);
  const [viewIpDialog, setViewIpDialog] = useState<boolean>(false);
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
  }).catch(noOpFn);

  const setStatusFn = (confession2: any, note?: string) =>
    apiClient.confessions.setStatus(confession2, { status: toggleStatus(confession2.status), note })
      .then((response) => {
        patchConfession(response);
        return response;
      }).catch(noOpFn);

  const deleteEntryFn = () => apiClient.confessions.delete(confession).then(async (response) => {
    patchConfession(response);
    return response;
  }).catch(noOpFn);

  const actionsList = (
    <Box mt={2}>
      {confession?.actions?.map((action, i) =>
        <Action action={action} index={confession.actions.length - 1 - i} key={action._id} />)}
    </Box>
  );

  return (
    <Container>
      {(confession ? (
        <Card>
          <ViewIPDialog
            confession={confession}
            open={viewIpDialog}
            onClose={() => setEditTagsDialog(false)}
          />
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
                <Box mx={2} onClick={() => setViewIpDialog(true)}>
                  <Typography color="primary">
                    IP
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
            <Divider variant="middle" />
            {confession.embed && (
            <>
              <Box display="flex" alignItems="center">
                <Box mr={2}>
                  <EmbedIcon />
                </Box>
                <Typography variant="subtitle1">
                  Embed:
                  {' '}
                  <Link href={confession.embed} rel="noopener" target="_blank">
                    {confession.embed}
                  </Link>
                </Typography>
              </Box>
              <Divider variant="middle" />
            </>
            )}
            {confession.survey && (
              <>
                <Box>
                  <Box>
                    <Box display="flex" alignItems="center">
                      <Box mr={2}>
                        <SurveyIcon />
                      </Box>
                      <Typography variant="subtitle1">
                        Survey question:
                        {' '}
                        {confession.survey.question}
                      </Typography>
                    </Box>
                  </Box>
                  <List>
                    {confession.survey.answers.map((answer) => (
                      <ListItem
                        key={answer}
                        dense
                      >
                        <ListItemIcon>
                          <RadioIcon />
                        </ListItemIcon>
                        <ListItemText primary={answer} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Divider variant="middle" />
              </>
            )}
            {actionsList}
          </CardContent>
        </Card>
      ) : <LinearProgress />)}
    </Container>
  );
}
