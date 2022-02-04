
import { alpha, TableRow } from '@mui/material';
import React from 'react';
import theme from '../theme';
import statusToClass from '../utils/statusToClass';
import { listStyleObject } from './listStyleObject';

export default function StyledTableRow(props: any) {
  const { status, children } = props;
  return <TableRow sx={{ backgroundColor: listStyleObject[statusToClass(status)] }}>{children}</TableRow>;
}
