import {
  Box,
  Card, CardContent, Typography
} from '@mui/material';
import React from 'react';
import theme from '../theme';


export default function Action({ action, index }: { action: any, index: number }) {
  const {
    time, action: actionText, note, user,
  } = action;
  return (
    <Card sx={{ marginBottom: 5 }} variant="outlined">
      <CardContent>
        <Box display="flex">
          <Box flexGrow={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="subtitle1">
                {actionText}
              </Typography>
              <Typography variant="caption">
                {time}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1">
                {note}
              </Typography>
              <Typography variant="caption">
                {user?.username || ''}
              </Typography>
            </Box>
          </Box>
          <Box sx={{
            marginLeft: theme.spacing(2),
            backgroundColor: theme.palette.grey[500],
            borderRadius: 50,
            padding: `10px`,
          }} alignSelf="center" alignContent="center" display="flex">
            {index + 1}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
