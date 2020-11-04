import {
  Container, LinearProgress, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core';
import EmbedIcon from '@material-ui/icons/Attachment';
import { RouteComponentProps } from '@reach/router';
import React, { useContext, useEffect, useState } from 'react';
import { APIContext } from '../App';
import ActionButtons from '../components/ActionButtons';
import ShortEmebed from '../components/ShortEmbed';
import StyledTableRow from '../components/StyledTableRow';
import { noOpFn, replaceInArray, toggleStatus } from '../utils';

export type IReply = any

const buildCommentLink = (reply: IReply) =>
  `https://wykop.pl/wpis/${reply.parentID.entryID}/${reply.commentID ? `#${reply.commentID}` : ''}`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Replies(props: RouteComponentProps) {
  const [replies, setReplies] = useState<IReply[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { httpClient, apiClient } = useContext(APIContext);

  const addReply = (reply: IReply) => apiClient.replies.add(reply).then((response) => {
    const updatedReplies = replaceInArray(replies, reply._id, response.patchObject);
    setReplies(updatedReplies);
  }).catch(noOpFn);

  const setStatusFn = (reply: IReply) =>
    apiClient.replies.setStatus(reply, { status: toggleStatus(reply.status) })
      .then((response) => {
        const updatedReplies = replaceInArray(reply, reply._id, response.patchObject);
        setReplies(updatedReplies);
      }).catch(noOpFn);

  const deleteReplyFn = (reply: IReply) => apiClient.replies.delete(reply)
    .then((response) => {
      const updatedReplies = replaceInArray(replies, reply._id, response.patchObject);
      setReplies(updatedReplies);
    }).catch(noOpFn);

  useEffect(() => {
    httpClient.swallow(httpClient.get('/replies'))
      .then((fetchedReplies) => {
        setReplies(fetchedReplies);
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
            {replies.map((reply: IReply) => (
              <StyledTableRow key={reply._id} status={reply.status} hover>
                <TableCell>
                  {reply._id}
                  <div>
                    {reply.embed && <Tooltip title="reply with embeded content"><EmbedIcon /></Tooltip>}
                  </div>
                </TableCell>
                <TableCell>
                  {reply.text}
                </TableCell>
                <TableCell style={{ maxWidth: 150, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  <ShortEmebed url={reply.embed} />
                </TableCell>
                <TableCell>
                  {reply.auth}
                </TableCell>
                <TableCell>
                  {reply.parentID.entryID && (
                  <Link href={buildCommentLink(reply)} rel="noopener" target="_blank">
                    {reply.parentID.entryID}
                    {reply.commentID && `#${reply.commentID}`}
                  </Link>
                  )}
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
