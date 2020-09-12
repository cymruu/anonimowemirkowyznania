import { Button, withStyles, Theme } from '@material-ui/core';

export default withStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
    // margg: '5px',
  },
}))(Button);
