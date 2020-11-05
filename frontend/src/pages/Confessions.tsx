import {
  Container, LinearProgress,
  Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Tooltip,
} from '@material-ui/core';
import EmbedIcon from '@material-ui/icons/Attachment';
import SurveyIcon from '@material-ui/icons/Poll';
import { Link as RouterLink, RouteComponentProps } from '@reach/router';
import React, { useContext, useEffect, useState } from 'react';
import { APIContext } from '../App';
import { AbsoluteLink } from '../components/AbsoluteLink';
import ConfessionActionButtons from '../components/ConfessionActionButtons';
import ShortEmebed from '../components/ShortEmbed';
import StyledTableRow from '../components/StyledTableRow';
import { noOpFn, replaceInArray, toggleStatus } from '../utils';

export type IConfession = any

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Confessions(props: RouteComponentProps) {
  const [confessions, setConfessions] = useState<IConfession[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { httpClient, apiClient } = useContext(APIContext);

  useEffect(() => {
    httpClient.swallow(httpClient.get('/confessions'))
      .then((fetchedConfessions) => {
        setConfessions(fetchedConfessions);
      })
      .finally(() => {
        setDataLoaded(true);
      });
  }, [httpClient]);

  const addEntry = (confession: IConfession) => apiClient.confessions.add(confession)
    .then((response) => {
      const updatedConfessions = replaceInArray(confessions, confession._id, response.patchObject);
      setConfessions(updatedConfessions);
    }).catch(noOpFn);

  const setStatusFn = (confession: IConfession, note?: string) =>
    apiClient.confessions.setStatus(confession, { status: toggleStatus(confession.status), note })
      .then((response) => {
        const updatedConfessions = replaceInArray(confessions, confession._id, response.patchObject);
        setConfessions(updatedConfessions);
      }).catch(noOpFn);

  const deleteEntryFn = (confession: IConfession) => apiClient.confessions.delete(confession)
    .then((response) => {
      const updatedConfessions = replaceInArray(confessions, confession._id, response.patchObject);
      setConfessions(updatedConfessions);
    }).catch(noOpFn);

  return (
    <Container>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Text</TableCell>
              <TableCell>Embed</TableCell>
              <TableCell>Auth</TableCell>
              <TableCell>Entry</TableCell>
              <TableCell>Added by</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {confessions.map((confession: IConfession) => (
              <StyledTableRow key={confession._id} status={confession.status} hover>
                <TableCell>
                  <AbsoluteLink component={RouterLink} to={`/confessions/${confession._id}`}>
                    {confession._id}
                  </AbsoluteLink>
                  <div>
                    {confession.survey && <Tooltip title="confession with survey"><SurveyIcon /></Tooltip>}
                    {confession.embed && <Tooltip title="confession with embeded content"><EmbedIcon /></Tooltip>}
                  </div>
                </TableCell>
                <TableCell style={{ maxWidth: 300 }}>
                  {confession.text}
                </TableCell>
                <TableCell style={{ maxWidth: 150, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  <ShortEmebed url={confession.embed} />
                </TableCell>
                <TableCell>
                  {confession.auth}
                </TableCell>
                <TableCell>
                  {confession.entryID && (
                  <Link href={`https://wykop.pl/wpis/${confession.entryID}`} rel="noopener" target="_blank">
                    {confession.entryID}
                  </Link>
                  )}
                </TableCell>
                <TableCell>
                  {confession.addedBy}
                </TableCell>
                <TableCell>
                  <ConfessionActionButtons
                    model={confession}
                    acceptFn={addEntry}
                    setStatusFn={setStatusFn}
                    deleteFn={deleteEntryFn}
                  />
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        {!dataLoaded && <LinearProgress />}
      </TableContainer>
    </Container>
  );
}
