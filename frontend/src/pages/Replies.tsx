import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
  Container, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Snackbar,
} from '@material-ui/core';
import StyledTableRow from '../components/StyledTableRow';
import HTTPClient from '../service/HTTPClient';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Replies(props: RouteComponentProps) {
  const [replies, setReplies] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [snackBar, setSnackBar] = useState({ open: false, message: undefined });

  useEffect(() => {
    const getReplies = async () => HTTPClient.get('/replies');
    getReplies()
      .then(async (res) => {
        const response = await res.json();

        if (response.success) {
          setReplies(response.data);
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
            {replies.map((reply: any) => (
              <StyledTableRow key={reply._id} status={reply.status} hover>
                <TableCell>
                  {reply._id}
                </TableCell>
                <TableCell>
                  {reply.text}
                </TableCell>
                <TableCell>
                  {reply.embed ? 'yes' : 'no'}
                </TableCell>
                <TableCell>
                  {reply.auth}
                </TableCell>
                <TableCell>
                  {reply.commentID}
                </TableCell>
                <TableCell>
                  {reply.addedBy}
                </TableCell>
                <TableCell />
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        {!dataLoaded && <LinearProgress />}
      </TableContainer>
    </Container>
  );
}
