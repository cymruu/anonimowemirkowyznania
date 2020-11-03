/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button, Container, makeStyles, Snackbar, TextField,
} from '@material-ui/core';
import { navigate, RouteComponentProps } from '@reach/router';
import React, { useCallback, useContext, useState } from 'react';
import { APIContext } from '../App';

const useStyles = makeStyles((theme) => ({
  form: {
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Login(props: RouteComponentProps) {
  const classes = useStyles();
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
  });
  const [result, setResult] = useState({ error: undefined });
  const [open, setOpen] = useState(false);
  const { httpClient } = useContext(APIContext);

  const handleClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const loginRequest = useCallback(() => {
    httpClient.post('/users/login', inputs)
      .then(async () => {
        navigate('/confessions');
      })
      .catch((err) => {
        setOpen(true);
        setResult({ error: err.message });
      });
  }, [inputs, httpClient]);

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
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          message={result.error}
        />
      </form>
    </Container>
  );
}
