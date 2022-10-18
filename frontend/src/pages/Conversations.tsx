import {
  Container, List, ListItem, ListItemText,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { APIContext } from '../App';
import { noOpFn } from '../utils';

export default function Permissions() {
  const { httpClient } = useContext(APIContext);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    httpClient.swallow(httpClient.get('/users/conversations'))
      .then((fetchedConversations) => {
        setConversations(fetchedConversations);
      }).catch(noOpFn);
  }, [httpClient, setConversations]);

  const conversationList = (
    <List>
      {conversations.map((conversation) => (
        <ListItem
          key={conversation._id}
          dense
          button
          component="a"
          href={`/conversation/${conversation._id}`}
          rel="noopener"
          target="_blank"
        >
          <ListItemText primary={conversation._id} />
        </ListItem>
      ))}
    </List>
  );
  return (<Container>{conversationList}</Container>);
}
