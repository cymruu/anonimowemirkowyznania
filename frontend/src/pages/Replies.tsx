import React, { useState, useEffect, useContext } from 'react';
import { RouteComponentProps } from '@reach/router';
import {
  Container, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow,
} from '@material-ui/core';
import StyledTableRow from '../components/StyledTableRow';
import { replaceInArray, toggleStatus } from '../utils';
import ActionButtons from '../components/ActionButtons';
import { APIContext } from '../App';

export type IReply = any

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Replies(props: RouteComponentProps) {
  const [replies, setReplies] = useState<IReply[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { httpClient, apiClient } = useContext(APIContext);

  const addReply = (reply: IReply) => apiClient.replies.add(reply).then((response) => {
    const updatedReplies = replaceInArray(replies, reply._id, response.patchObject);
    setReplies(updatedReplies);
  });

  const setStatusFn = (reply: IReply) =>
    apiClient.replies.setStatus(reply, { status: toggleStatus(reply.status) })
      .then((response) => {
        const updatedReplies = replaceInArray(reply, reply._id, response.patchObject);
        setReplies(updatedReplies);
      });

  const deleteReplyFn = (reply: IReply) => apiClient.replies.delete(reply)
    .then((response) => {
      const updatedReplies = replaceInArray(replies, reply._id, response.patchObject);
      setReplies(updatedReplies);
    });

  useEffect(() => {
    httpClient.swallow(httpClient.get('/replies'))
      .then((response) => {
        setReplies(response);
      })
      .finally(() => {
        setDataLoaded(true);
      });
  }, [httpClient]);

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
