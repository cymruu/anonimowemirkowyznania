import {
  fade, TableRow, Theme, withStyles,
} from '@material-ui/core';
import React from 'react';
import statusToClass from '../utils/statusToClass';

function StyledTableRow(props: any) {
  const { status, classes, children } = props;
  return <TableRow className={classes[statusToClass(status)]}>{children}</TableRow>;
}

export default withStyles((theme: Theme) => ({
  declined: {
    backgroundColor: fade(theme.palette.error.light, 0.195),
  },
  pending: {
    backgroundColor: fade(theme.palette.warning.light, 0.1),
  },
  added: {
    backgroundColor: fade(theme.palette.success.light, 0.2),
  },
}))(StyledTableRow);
