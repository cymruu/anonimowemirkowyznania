import {
  AppBar, Button, IconButton, Link, makeStyles, Toolbar, Typography,
} from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuIcon from '@material-ui/icons/Menu';
import { Link as RouterLink, Router } from '@reach/router';
import React, {
  createContext, useEffect, useMemo, useState,
} from 'react';
import { useSnackbar } from 'notistack';
import ConfessionDetails from './pages/ConfessionDetails';
import Confessions from './pages/Confessions';
import Replies from './pages/Replies';
import Index from './pages/Index';
import Login from './pages/Login';
import { HTTPClient } from './service/HTTPClient';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export const APIContext = createContext<{httpClient: HTTPClient}>({ httpClient: new HTTPClient() });

function App() {
  const classes = useStyles();
  const [user, setUser] = useState(undefined);
  const { enqueueSnackbar } = useSnackbar();
  const httpClient = useMemo(() => new HTTPClient([
    (err) => {
      enqueueSnackbar(err.message);
      return err;
    },
  ]), [enqueueSnackbar]);

  useEffect(() => {
    httpClient.swallow(httpClient.get('/users'))
      .then(async (res) => {
        setUser(res);
      });
  }, [httpClient]);

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <IconButton className={classes.menuButton} edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Anonimowe Mirko Wyznania
          </Typography>
          <Button color="inherit">
            <Link component={RouterLink} to="/confessions" color="inherit">confessions</Link>
          </Button>
          <Button color="inherit">
            <Link component={RouterLink} to="/replies" color="inherit">replies</Link>
          </Button>
          <Button color="inherit">
            <Link component={RouterLink} to="/login" color="inherit">login</Link>
          </Button>
          {user && (
          <IconButton
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <APIContext.Provider value={{ httpClient }}>
        <Router>
          <Index path="/" />
          <Confessions path="/confessions" />
          <ConfessionDetails path="/confessions/:id" />
          <Replies path="/replies" />
          <Login path="/login" />
        </Router>
      </APIContext.Provider>
    </>
  );
}

export default App;
