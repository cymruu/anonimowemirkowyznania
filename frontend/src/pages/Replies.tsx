import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
  Container, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Snackbar,
} from '@material-ui/core';
import StyledTableRow from '../components/StyledTableRow';
import HTTPClient, { ApiError } from '../service/HTTPClient';
import { ApiAddReply, ApiDeleteReply, ApiSetReplyStatus } from '../service/api';
import { replaceInArray } from '../utils';
import ActionButtons from '../components/ActionButtons';

export type IReply = any

export const toggleReplyStatus = (reply: IReply, note?: string) => {
  const status = reply.status === 0 ? -1 : 0;
  return ApiSetReplyStatus(reply, { status, note })
    .then(async (res) => res.json());
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Replies(props: RouteComponentProps) {
  const [replies, setReplies] = useState<IReply[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [snackBar, setSnackBar] = useState({ open: false, message: '' });

  const addReply = (reply: IReply) => ApiAddReply(reply).then(async (response) => {
    const updatedReplies = replaceInArray(replies, reply._id, response.patchObject);
    setReplies(updatedReplies);
  });

  const setStatusFn = (reply: IReply, note?: string) => toggleReplyStatus(reply, note)
    .then((response) => {
      const updatedReplies = replaceInArray(reply, reply._id, response.patchObject);
      setReplies(updatedReplies);
    });

  const deleteReplyFn = (reply: IReply) => ApiDeleteReply(reply)
    .then(async (response) => {
      const updatedReplies = replaceInArray(replies, reply._id, response.patchObject);
      setReplies(updatedReplies);
    });

  useEffect(() => {
    const getReplies = async () => HTTPClient.get('/replies');
    getReplies()
      .then(async (response) => {
        setReplies(response);
      })
      .catch((err: ApiError) => {
        setSnackBar({ open: true, message: err.message });
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
                <TableCell>
                  <ActionButtons
                    model={reply}
                    acceptFn={addReply}
                    setStatusFn={setStatusFn}
                    deleteFn={deleteReplyFn}
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
