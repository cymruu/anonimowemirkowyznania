import { AppBar, Button, IconButton, Link, makeStyles, Toolbar, Typography } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuIcon from '@material-ui/icons/Menu';
import { Link as RouterLink, Router } from '@reach/router';
import React, { Fragment, useEffect, useState } from 'react';
import { Confessions } from './pages/Confessions';
import { Index } from './pages/Index';
import { Login } from './pages/Login';
import HTTPClient from './service/HTTPClient';

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
  const [user, setUser] = useState(undefined)
  useEffect(()=>{
    const getUser = () => HTTPClient.get('/users')
    getUser().then(async res=>{
      const {data} = await res.json()
      setUser(data)
    }).catch(()=>undefined)
  }, [])

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
            <Link component={RouterLink} to="/confessions" color="inherit">confessions</Link>
          </Button>
          <Button color="inherit">
            <Link component={RouterLink} to="/login" color="inherit">Login</Link>
          </Button>
          {user && <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                color="inherit"
              >
                <AccountCircle />
            </IconButton>}
        </Toolbar>
      </AppBar>
      <Router>
        <Index path="/" />
        <Confessions path="/confessions" />
        <Login path="/login" />
      </Router>
    </Fragment>
  );
}

export default App;
