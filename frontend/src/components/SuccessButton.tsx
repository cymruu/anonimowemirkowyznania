import { Button, withStyles, Theme } from "@material-ui/core";

export const SuccessButton = withStyles((theme: Theme)=>({
    root: {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.common.white,
    },
  }))(Button);