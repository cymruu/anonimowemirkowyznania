import { alpha, CardHeader } from '@mui/material';
import React from 'react';
import theme from '../theme';
import statusToClass from '../utils/statusToClass';
import { listStyleObject } from './listStyleObject';

const tableCardBgOpacity = 0.2;

export default function StyledCardHeader(props: any) {
  const {
    status, children, ...rest
  } = props;


  return <CardHeader sx={{ marginBottom: '8px', backgroundColor: listStyleObject[statusToClass(status)] }} {...rest}>{children}</CardHeader>;
}

