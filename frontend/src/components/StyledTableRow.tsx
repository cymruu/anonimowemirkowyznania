
import { alpha, TableRow, Theme } from '@mui/material';
import { withStyles } from '@mui/styles';
import React from 'react';
import statusToClass from '../utils/statusToClass';

function StyledTableRow(props: any) {
  const { status, classes, children } = props;
  return <TableRow className={classes[statusToClass(status)]}>{children}</TableRow>;
}

export default withStyles((theme: Theme) => ({
  declined: {
    backgroundColor: alpha(theme.palette.error.light, 0.195),
  },
  pending: {
    backgroundColor: alpha(theme.palette.warning.light, 0.1),
  },
  added: {
    backgroundColor: alpha(theme.palette.success.light, 0.2),
  },
}))(StyledTableRow);
