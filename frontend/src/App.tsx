import {
  AppBar, Button, IconButton, Link, makeStyles, Toolbar, Typography,
} from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MenuIcon from '@material-ui/icons/Menu';
import { Link as RouterLink, Router } from '@reach/router';
import { useSnackbar } from 'notistack';
import React, {
  createContext, useEffect, useMemo, useState,
} from 'react';
import ConfessionDetails from './pages/ConfessionDetails';
import Confessions from './pages/Confessions';
import Index from './pages/Index';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Replies from './pages/Replies';
import createAPIClient from './service/api';
import { HTTPClient } from './service/HTTPClient';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#d2d2d2',
    marginBottom: 10,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));
export const makePath = (path: string) => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return path;
  }
  return `/admin2${path}`;
};

const defaultHTTPClient = new HTTPClient();
export const APIContext = createContext<{
  httpClient: HTTPClient,
  apiClient: ReturnType<typeof createAPIClient>
}>({
  httpClient: defaultHTTPClient,
  apiClient: createAPIClient(defaultHTTPClient),
});

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
  const apiClient = createAPIClient(httpClient);

  useEffect(() => {
    httpClient.swallow(httpClient.get('/users'))
      .then((res) => {
        setUser(res);
      });
  }, [httpClient]);

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="default" className={classes.header}>
        <Toolbar>
          <IconButton className={classes.menuButton} edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Anonimowe Mirko Wyznania
          </Typography>
          <Button color="inherit">
            <Link component={RouterLink} to={makePath('/confessions')} color="inherit">confessions</Link>
          </Button>
          <Button color="inherit">
            <Link component={RouterLink} to={makePath('/replies')} color="inherit">replies</Link>
          </Button>
          {user ? (
            <>
              <IconButton
                color="inherit"
              >
                <AccountCircleIcon />
              </IconButton>
              <Button color="inherit">
                <Link component={RouterLink} to={makePath('/logout')} color="inherit">logout</Link>
              </Button>
            </>
          ) : (
              <Button color="inherit">
                <Link component={RouterLink} to={makePath('/login')} color="inherit">login</Link>
              </Button>
            )}
        </Toolbar>
      </AppBar>
      <APIContext.Provider value={{ httpClient, apiClient }}>
        <Router>
          <Index path={makePath('/')} />
          <Confessions path={makePath('/confessions')} />
          <ConfessionDetails path={makePath('/confessions/:id')} />
          <Replies path={makePath('/replies')} />
          <Login path={makePath('/login')} setUser={setUser} />
          <Logout path={makePath('/logout')} setUser={setUser} />
        </Router>
      </APIContext.Provider>
    </>
  );
}

export default App;
