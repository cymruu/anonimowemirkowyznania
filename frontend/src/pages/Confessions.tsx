import {
  Container, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Snackbar, Link,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, RouteComponentProps } from '@reach/router';
import ActionButtons from '../components/ActionButtons';
import StyledTableRow from '../components/StyledTableRow';
import HTTPClient, { ApiError } from '../service/HTTPClient';
import { ApiAddEntry, ApiDeleteEntry, ApiSetConfessionStatus } from '../service/api';

function replaceConfession(confessions: any, _id: string, patchObject: object) {
  const confessionsCopy: any[] = [...confessions];
  const index = confessionsCopy.findIndex((x) => x._id === _id);
  confessionsCopy[index] = { ...confessionsCopy[index], ...patchObject };
  return confessionsCopy;
}

export const toggleConfessionStatus = (confession:any, note?:string) => {
  const status = confession.status === 0 ? -1 : 0;
  return ApiSetConfessionStatus(confession, { status, note });
};

export type toggleConfessionStatusFn = typeof toggleConfessionStatus

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Confessions(props: RouteComponentProps) {
  const [confessions, setConfessions] = useState<any>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [snackBar, setSnackBar] = useState({ open: false, message: '' });

  useEffect(() => {
    HTTPClient.get('/confessions')
      .then((fetchedConfessions) => {
        setConfessions(fetchedConfessions);
      })
      .catch((err: ApiError) => {
        setSnackBar({ open: true, message: err.message });
      })
      .finally(() => {
        setDataLoaded(true);
      });
  }, []);

  const addEntry = (confession: any) => ApiAddEntry(confession)
    .then(async (response) => {
      const updatedConfessions = replaceConfession(confessions, confession._id, response.patchObject);
      setConfessions(updatedConfessions);
    });

  const setStatusFn = (confession: any, note?: string) => toggleConfessionStatus(confession, note)
    .then((response) => {
      const updatedConfessions = replaceConfession(confessions, confession._id, response.patchObject);
      setConfessions(updatedConfessions);
    });

  const deleteEntryFn = (confession: any) => ApiDeleteEntry(confession)
    .then(async (response) => {
      const updatedConfessions = replaceConfession(confessions, confession._id, response.patchObject);
      setConfessions(updatedConfessions);
    });

  return (
    <Container>
      <Snackbar open={snackBar.open} message={snackBar.message} />
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
                  <ActionButtons
                    confession={confession}
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
