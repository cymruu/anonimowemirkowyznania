import { Button, Theme} from '@mui/material';
import { withStyles } from '@mui/styles';

export default withStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
  },
}))(Button);
