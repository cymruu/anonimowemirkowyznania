import {
  Container, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Link,
} from '@material-ui/core';
import React, { useEffect, useState, useContext } from 'react';
import { Link as RouterLink, RouteComponentProps } from '@reach/router';
import ConfessionActionButtons from '../components/ConfessionActionButtons';
import StyledTableRow from '../components/StyledTableRow';
import { replaceInArray, toggleStatus } from '../utils';
import { APIContext } from '../App';

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
    });

  const setStatusFn = (confession: IConfession, note?: string) =>
    apiClient.confessions.setStatus(confession, { status: toggleStatus(confession.status), note })
      .then((response) => {
        const updatedConfessions = replaceInArray(confessions, confession._id, response.patchObject);
        setConfessions(updatedConfessions);
      });

  const deleteEntryFn = (confession: IConfession) => apiClient.confessions.delete(confession)
    .then((response) => {
      const updatedConfessions = replaceInArray(confessions, confession._id, response.patchObject);
      setConfessions(updatedConfessions);
    });

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
            {confessions.map((confession: any) => (
              <StyledTableRow key={confession._id} status={confession.status} hover>
                <TableCell>
                  <Link component={RouterLink} to={`/confessions/${confession._id}`}>
                    {confession._id}
                  </Link>
                </TableCell>
                <TableCell>
                  {confession.text}
                </TableCell>
                <TableCell>
                  {confession.embed ? 'yes' : 'no'}
                </TableCell>
                <TableCell>
                  {confession.auth}
                </TableCell>
                <TableCell>
                  {confession.entryID}
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
