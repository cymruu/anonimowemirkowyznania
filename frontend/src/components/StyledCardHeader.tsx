import {
  CardHeader, fade, Theme, withStyles,
} from '@material-ui/core';
import React from 'react';
import statusToClass from '../utils/statusToClass';

function StyledCardHeader(props: any) {
  const {
    status, classes, children, ...rest
  } = props;
  return <CardHeader className={classes[statusToClass(status)]} {...rest}>{children}</CardHeader>;
}

const tableBgOpacity = 0.2;

export default withStyles((theme: Theme) => ({
  root: {
    marginBottom: '8px',
  },
  declined: {
    backgroundColor: fade(theme.palette.error.light, tableBgOpacity),
  },
  pending: {
    backgroundColor: fade(theme.palette.warning.light, tableBgOpacity),
  },
  added: {
    backgroundColor: fade(theme.palette.success.light, tableBgOpacity),
  },
}))(StyledCardHeader);
