import { alpha } from "@mui/material";
import theme from "../theme";

export const listStyleObject = {
  declined: {
    backgroundColor: alpha(theme.palette.error.light, 0.195),
  },
  pending: {
    backgroundColor: alpha(theme.palette.warning.light, 0.1),
  },
  added: {
    backgroundColor: alpha(theme.palette.success.light, 0.2),
  },
};
