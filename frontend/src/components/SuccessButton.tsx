import { Button, Theme, withStyles } from '@material-ui/core';

export default withStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
  },
}))(Button);
