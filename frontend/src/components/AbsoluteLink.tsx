import { Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React from 'react';

export const AbsoluteLink = ({ to = '', children, ...props }: any) => {
  
  return (
    <Link {...props} to={to} color="inherit">
      {children}
    </Link>
  );
};

export const absoluteNavigate = (to: any) => {
  const navigate = useNavigate()
  const absoluteTo = to;
  return navigate(absoluteTo);
};
