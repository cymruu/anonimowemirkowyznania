import {
  Button,
  Container, FormControl, FormGroup, FormHelperText, Input, InputLabel, List, ListItem, ListItemText, TextField
} from '@mui/material';
import { RouteComponentProps } from '@reach/router';
import { ChangeEvent, ChangeEventHandler, FormEventHandler, useContext, useEffect, useState } from 'react';
import { APIContext } from '../App';

export default function Donations(props: RouteComponentProps) {
  const { httpClient } = useContext(APIContext);
  const [donations, setDonations] = useState<any[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [inputs, setInputs] = useState({
    amount: 0,
    from: '',
    message: '',
  });

  useEffect(() => {
    loadDonations()
  }, [httpClient])

  const loadDonations = () => httpClient.swallow(httpClient.get('/donations'))
    .then((response) => {
      setDonations(response.donations)
    });


  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault()
    setIsSending(true)

    await httpClient.post('donations', inputs)
    setIsSending(false)
    loadDonations()
  }

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { id, value } = event.target;

    setInputs((input) => ({ ...input, [id]: value }))
  }

  const donationForm = (
    <form autoComplete="off" onSubmit={handleSubmit}>
      <FormGroup row>
        <TextField id="amount" label="Amount" type="number" value={inputs.amount} onChange={handleChange}>Amount</TextField>
        <TextField id="from" label="From" value={inputs.from} onChange={handleChange}>From</TextField>
        <TextField id="message" label="Message" value={inputs.message} onChange={handleChange}>Message</TextField>
        <Button disabled={isSending} type="submit" color="primary" variant="contained">Submit</Button>
      </FormGroup>
    </form>
  );

  const donationList = (
    <List>
      {donations.map((donation) => (
        <ListItem
          key={donation._id}
          dense
          button
          component="a"
          href={`/conversation/${donation._id}`}
          rel="noopener"
          target="_blank"
        >
          <ListItemText primary={donation._id} />
        </ListItem>
      ))}
    </List>
  );
  return (
    <>
      <Container>{donationForm}</Container>
      <Container>{donationList}</Container>
    </>
  );
}
