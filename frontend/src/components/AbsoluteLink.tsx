import { Link } from '@mui/material';
import { navigate } from '@reach/router';
import React from 'react';

export const BASEPATH = process.env.PUBLIC_URL;

export const AbsoluteLink = ({ to = '', children, ...props }: any) => {
  const absoluteTo = BASEPATH + to;

  return (
    <Link {...props} to={absoluteTo} color="inherit">
      {children}
    </Link>
  );
};

export const absoluteNavigate = (to: any) => {
  const absoluteTo = BASEPATH + to;
  return navigate(absoluteTo);
};
