import {
  Button, Container, makeStyles, TextField,
} from '@material-ui/core';
import { navigate, RouteComponentProps } from '@reach/router';
import React, {
  Dispatch, useCallback, useContext, useState,
} from 'react';
import { APIContext } from '../App';

const useStyles = makeStyles((theme) => ({
  form: {
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Login(props: RouteComponentProps & {setUser: Dispatch<any>}) {
  const { setUser } = props;
  const classes = useStyles();
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
  });
  const { httpClient } = useContext(APIContext);

  const loginRequest = useCallback(() => {
    httpClient.swallow(httpClient.post('/users/login', inputs))
      .then(async ({ token }) => {
        navigate('/confessions')
          .then(() => {
            setUser(token);
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
      <form autoComplete="off" className={classes.form} onSubmit={handleSubmit}>
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
          className={classes.submit}
        >
          Login
        </Button>
      </form>
    </Container>
  );
}
