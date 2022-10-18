import {
  Container, LinearProgress, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import EmbedIcon from '@mui/icons-material/Attachment';
import React, {
  useContext, useMemo,
} from 'react';
import { APIContext } from '../App';
import ActionButtons from '../components/ActionButtons';
import ShortEmebed from '../components/ShortEmbed';
import StyledTableRow from '../components/StyledTableRow';
import { noOpFn, toggleStatus } from '../utils';
import usePagination from '../components/pagination';
import { HTTPClient } from '../service/HTTPClient';

export type IReply = any

const getPage = (httpClient: HTTPClient) =>
  (page: number, perPage: number) =>
    httpClient.swallow(httpClient.get(`/replies?page=${page}&perPage=${perPage}`));

const buildCommentLink = (reply: IReply) =>
  `https://wykop.pl/wpis/${reply.parentID.entryID}/${reply.commentID ? `#comment-${reply.commentID}` : ''}`;

export default function Replies() {
  const { httpClient, apiClient } = useContext(APIContext);

  const getPageMemoized = useMemo(() => getPage(httpClient), [httpClient]);

  const {
    data: replies, isLoading, paginationComponent, setData,
  } = usePagination(getPageMemoized);

  const addReply = (reply: IReply) => apiClient.replies.add(reply).then((response) => {
    setData({ type: 'replace', id: reply._id, patchObject: response.patchObject });
  }).catch(noOpFn);

  const setStatusFn = (reply: IReply) =>
    apiClient.replies.setStatus(reply, { status: toggleStatus(reply.status) })
      .then((response) => {
        setData({ type: 'replace', id: reply._id, patchObject: response.patchObject });
      }).catch(noOpFn);

  const deleteReplyFn = (reply: IReply) => apiClient.replies.delete(reply)
    .then((response) => {
      setData({ type: 'replace', id: reply._id, patchObject: response.patchObject });
    }).catch(noOpFn);

  return (
    <Container>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nick</TableCell>
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
                  {reply.alias}
                </TableCell>
                <TableCell style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
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
                      <div>
                        {reply.parentID.entryID}
                      </div>
                      <div>
                        {reply.commentID && `#${reply.commentID}`}
                      </div>
                    </Link>
                  )}
                </TableCell>
                <TableCell style={{ maxWidth: 50, textOverflow: 'ellipsis', overflow: 'hidden' }}>
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
      </TableContainer>
      {isLoading && <LinearProgress />}
      {paginationComponent}
    </Container>
  );
}
