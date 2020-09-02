import React, { Fragment } from 'react';
import { Link as RouterLink, Router } from '@reach/router'
import { Index } from './pages/Index';
import CssBaseline from '@material-ui/core/CssBaseline';
import { AppBar, Toolbar, IconButton, Typography, Button, makeStyles, Link } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Login } from './pages/Login';
import { Confessions } from './pages/Confessions';

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

function App() {
  const classes = useStyles();
  return (
    <Fragment>
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
            <Link component={RouterLink} to="/login" color="inherit">Login</Link>
          </Button>
        </Toolbar>
      </AppBar>
      <Router>
        <Index path="/" />
        <Login path="/login" />
        <Confessions path="/confessions" />
      </Router>
    </Fragment>
  );
}

export default App;
