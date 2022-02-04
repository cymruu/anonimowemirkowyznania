import { alpha, CardHeader, Theme } from '@mui/material';
import { withStyles } from '@mui/styles';
import React from 'react';
import statusToClass from '../utils/statusToClass';

function StyledCardHeader(props: any) {
  const {
    status, classes, children, ...rest
  } = props;
  return <CardHeader className={classes[statusToClass(status)]} {...rest}>{children}</CardHeader>;
}

const tableBgOpacity = 0.2;

export default withStyles((theme:Theme) => ({
  root: {
    marginBottom: '8px',
  },
  declined: {
    backgroundColor: alpha(theme.palette.error.light, tableBgOpacity),
  },
  pending: {
    backgroundColor: alpha(theme.palette.warning.light, tableBgOpacity),
  },
  added: {
    backgroundColor: alpha(theme.palette.success.light, tableBgOpacity),
  },
}))(StyledCardHeader);
