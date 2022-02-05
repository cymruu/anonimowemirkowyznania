import {
  Button, Container, TextField
} from '@mui/material';
import { RouteComponentProps } from '@reach/router';
import React, {
  Dispatch, useCallback, useContext, useState
} from 'react';
import { APIContext } from '../App';
import { absoluteNavigate } from '../components/AbsoluteLink';


export default function Login(props: RouteComponentProps & { setUser: Dispatch<any> }) {
  const { setUser } = props;
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
  });
  const { httpClient } = useContext(APIContext);

  const loginRequest = useCallback(() => {
    httpClient.swallow(httpClient.post('/users/login', inputs))
      .then((user) => {
        absoluteNavigate('/confessions')
          .then(() => {
            setUser(user);
          });
      });
  }, [inputs, httpClient, setUser]);

  function handleChange(event: any) {
    const { name, value } = event.target;
    setInputs((input) => ({ ...input, [name]: value }));
  }
  function handleSubmit(event: any) {
    event.preventDefault();
    loginRequest();
  }
  return (
    <Container maxWidth="xs">
      <form autoComplete="off" onSubmit={handleSubmit}>
        <div>
          <TextField
            label="Username"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="username"
            value={inputs.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <TextField
            label="Password"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            value={inputs.password}
            onChange={handleChange}
            type="password"
          />
        </div>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
        >
          Login
        </Button>
      </form>
    </Container>
  );
}
