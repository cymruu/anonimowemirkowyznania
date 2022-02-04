import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar, Button, CssBaseline, IconButton, Theme, Toolbar, Typography
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link as RouterLink, Router } from '@reach/router';
import { useSnackbar } from 'notistack';
import React, {
  createContext, useEffect, useMemo, useState
} from 'react';
import { AbsoluteLink } from './components/AbsoluteLink';
import ConfessionDetails from './pages/ConfessionDetails';
import Confessions from './pages/Confessions';
import Conversations from './pages/Conversations';
import Index from './pages/Index';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Permissions from './pages/Permissions';
import Replies from './pages/Replies';
import createAPIClient from './service/api';
import { HTTPClient } from './service/HTTPClient';

const useStyles = makeStyles((theme: Theme) => ({
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

  const [user, setUser] = useState<any>(undefined);
  const { enqueueSnackbar } = useSnackbar();
  const httpClient = useMemo(() => new HTTPClient([
    (err) => {
      enqueueSnackbar(err.message);
      return err;
    },
  ]), [enqueueSnackbar]);
  const apiClient = createAPIClient(httpClient);

  const hasPermission = (permission: string) => !!user?.permissions[permission];

  useEffect(() => {
    httpClient.swallow(httpClient.get('/users/me'))
      .then((res) => {
        setUser(res);
      });
  }, [httpClient]);

  return (
    <>
      <AppBar position="static" color="default" className={classes.header}>
        <Toolbar>
          <IconButton className={classes.menuButton} edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Anonimowe Mirko Wyznania
          </Typography>
          <Button color="inherit">
            <AbsoluteLink component={RouterLink} to="/confessions" color="inherit">confessions</AbsoluteLink>
          </Button>
          <Button color="inherit">
            <AbsoluteLink component={RouterLink} to="/replies" color="inherit">replies</AbsoluteLink>
          </Button>
          {hasPermission('accessModsList') && (
          <Button color="inherit">
            <AbsoluteLink component={RouterLink} to="/permissions" color="inherit">permissions</AbsoluteLink>
          </Button>
          )}
          {hasPermission('accessMessages') && (
          <Button color="inherit">
            <AbsoluteLink component={RouterLink} to="/conversations" color="inherit">conversations</AbsoluteLink>
          </Button>
          )}
          {user ? (
            <>
              <IconButton
                color="inherit"
              >
                <AccountCircleIcon />
              </IconButton>
              <Button color="inherit">
                <AbsoluteLink component={RouterLink} to="/logout" color="inherit">logout</AbsoluteLink>
              </Button>
            </>
          ) : (
            <Button color="inherit">
              <AbsoluteLink component={RouterLink} to="/login" color="inherit">login</AbsoluteLink>
            </Button>
          ) }
        </Toolbar>
      </AppBar>
      <APIContext.Provider value={{ httpClient, apiClient }}>
        <Router basepath={process.env.PUBLIC_URL}>
          <Index path="/" />
          <Confessions path="/confessions" />
          <ConfessionDetails path="/confessions/:id" />
          <Replies path="/replies" />
          <Permissions path="/permissions" />
          <Conversations path="/conversations" />
          <Login path="/login" setUser={setUser} />
          <Logout path="/logout" setUser={setUser} />
        </Router>
      </APIContext.Provider>
    </>
  );
}

export default App;
