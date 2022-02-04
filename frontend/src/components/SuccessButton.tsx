
import { Button, Theme } from '@mui/material';
import { styled } from '@mui/styles';

export default styled(Button)<Theme>(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
  marginBottom: 5,
}))
