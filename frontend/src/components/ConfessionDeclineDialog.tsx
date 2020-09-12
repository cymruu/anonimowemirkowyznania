import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControl,
  FormLabel, RadioGroup, FormControlLabel, Radio, TextField, Snackbar,
} from '@material-ui/core';
import React, { SyntheticEvent, useState } from 'react';
import { buttonActionFunction } from './ActionButtons';

export default function ConfessionDeclineDialog(
  {
    confession, open, setDeclineDialogOpen, setStatusFn,
  }:
  {
    confession: any,
    open: boolean,
    setDeclineDialogOpen: (value: boolean) => void,
    setStatusFn: buttonActionFunction
  },
) {
  const [reason, setReason] = useState<string|null>(null);
  const [error, setError] = useState({ open: false, message: undefined });

  const setStatusWrapped = (event: SyntheticEvent) => {
    event.preventDefault();
    return setStatusFn(confession).then(() => {
      setDeclineDialogOpen(false);
    }).catch(async (err: Response | Error) => {
      if (err instanceof Error) {
        console.log(err);
      } else {
        const { error: errorObj } = await err.json();
        setError({ open: true, ...errorObj });
      }
    });
  };

  return (
    <>
      <Snackbar open={error.open} message={error.message} />
      <Dialog
        open={open}
        onClose={() => setDeclineDialogOpen(false)}
      >
        <DialogTitle>Set confession decline reason</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <FormLabel component="legend">Select reason:</FormLabel>
            <RadioGroup name="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              <FormControlLabel value="reason 1" control={<Radio />} label="Reason 1" />
              <FormControlLabel value="reason 2" control={<Radio />} label="Reason 2" />
              <FormControlLabel value="custom" control={<Radio />} label="Custom" />
              <TextField
                disabled={reason !== 'custom'}
                autoFocus
                margin="dense"
                id="name"
                label="Custom decline reason"
                type="reason-text"
                fullWidth
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeclineDialogOpen(false)} color="primary">
            Close
          </Button>
          <Button onClick={setStatusWrapped} color="primary" autoFocus>
            Decline with reason:
            {' '}
            {reason}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
