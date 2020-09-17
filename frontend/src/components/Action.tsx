import {
  Box,
  Card, CardContent, createStyles, makeStyles, Theme, Typography,
} from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    marginBottom: 5,
  },
  actionNumber: {
    marginLeft: 15,
    backgroundColor: theme.palette.grey[500],
    borderRadius: 50,
    padding: 10,
  },
}));

export default function Action({ action, index }: {action:any, index: number}) {
  const classes = useStyles();
  const {
    time, action: actionText, note, user,
  } = action;
  return (
    <Card className={classes.root} variant="outlined">
      <CardContent>
        <Box display="flex">
          <Box flexGrow={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">
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
          <Box className={classes.actionNumber} alignSelf="center" alignContent="center" display="flex">
            {index + 1}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
