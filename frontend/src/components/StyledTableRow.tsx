import {
  fade, TableRow, Theme, withStyles,
} from '@material-ui/core';
import React from 'react';
import statusToClass from '../utils/statusToClass';

function StyledTableRow(props: any) {
  const { status, classes, children } = props;
  return <TableRow className={classes[statusToClass(status)]}>{children}</TableRow>;
}

const tableBgOpacity = 0.2;

export default withStyles((theme: Theme) => ({
  declined: {
    backgroundColor: fade(theme.palette.error.light, tableBgOpacity),
  },
  pending: {
    backgroundColor: fade(theme.palette.warning.light, tableBgOpacity),
  },
  added: {
    backgroundColor: fade(theme.palette.success.light, tableBgOpacity),
  },
}))(StyledTableRow);
