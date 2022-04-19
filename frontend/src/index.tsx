import React from 'react';
import ReactDOM from 'react-dom';
import { SnackbarProvider } from 'notistack';
import App from './App';
import * as serviceWorker from './serviceWorker';
import theme from './theme';
import { CssBaseline, ThemeProvider } from '@mui/material';


ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  </ThemeProvider>,
  // eslint-disable-next-line no-undef
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
