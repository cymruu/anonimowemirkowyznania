import {
  Container, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Snackbar, Link,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, RouteComponentProps } from '@reach/router';
import ActionButtons from '../components/ActionButtons';
import StyledTableRow from '../components/StyledTableRow';
import HTTPClient from '../service/HTTPClient';
import { ApiAddEntry, ApiDeleteEntry, ApiSetConfessionStatus } from '../service/api';

function replaceConfession(confessions: any, _id: string, patchObject: object) {
  const confessionsCopy: any[] = [...confessions];
  const index = confessionsCopy.findIndex((x) => x._id === _id);
  confessionsCopy[index] = { ...confessionsCopy[index], ...patchObject };
  return confessionsCopy;
}

const toggleConfessionStatus = (confession:any, note?:string) => {
  const status = confession.status === 0 ? -1 : 0;
  return ApiSetConfessionStatus(confession, { status, note })
    .then(async (res) => res.json());
};

export type toggleConfessionStatusFn = typeof toggleConfessionStatus

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Confessions(props: RouteComponentProps) {
  const [confessions, setConfessions] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [snackBar, setSnackBar] = useState({ open: false, message: undefined });

  useEffect(() => {
    const getConfessions = async () => HTTPClient.get('/confessions');
    getConfessions()
      .then(async (res) => {
        const response = await res.json();

        if (response.success) {
          setConfessions(response.data);
        }
      })
      .catch(async (err: Response | Error) => {
        if (err instanceof Error) {
          console.log(err);
        } else {
          const { error } = await err.json();
          setSnackBar({ open: true, ...error });
        }
      })
      .finally(() => {
        setDataLoaded(true);
      });
  }, []);

  const addEntry = (confession: any) => ApiAddEntry(confession)
    .then(async (res) => {
      const response = await res.json();
      const updatedConfessions = replaceConfession(confessions, confession._id, response.data.patchObject);
      setConfessions(updatedConfessions as any);
    });

  const setStatusFn = (confession: any, note?: string) => toggleConfessionStatus(confession, note)
    .then((response) => {
      const updatedConfessions = replaceConfession(confessions, confession._id, response.data.patchObject);
      setConfessions(updatedConfessions as any);
    });

  const deleteEntryFn = (confession: any) => ApiDeleteEntry(confession)
    .then(async (res) => {
      const response = await res.json();
      const updatedConfessions = replaceConfession(confessions, confession._id, response.data.patchObject);
      setConfessions(updatedConfessions as any);
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
