import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  FormControlLabel, FormLabel, Radio, RadioGroup, Snackbar, TextField,
} from '@material-ui/core';
import React, { SyntheticEvent, useState } from 'react';
import { ApiError } from '../service/HTTPClient';

export default function ConfessionDeclineDialog(
  {
    confession, open, setDeclineDialogOpen, setStatusFn,
  }:
  {
    confession: any,
    open: boolean,
    setDeclineDialogOpen: (value: boolean) => void,
    setStatusFn: any // todo
  },
) {
  const [reason, setReason] = useState<string|null>(null);
  const [customReason, setCustomReason] = useState<string>('');
  const [error, setError] = useState({ open: false, message: '' });

  const setStatusWrapped = (event: SyntheticEvent) => {
    event.preventDefault();
    const declineReason = reason === 'custom' ? customReason : reason;
    return setStatusFn(confession, declineReason || '').then(() => {
      setDeclineDialogOpen(false);
    })
      .catch((err: ApiError) => {
        setError({ open: true, message: err.message });
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
                value={customReason}
                autoFocus
                margin="dense"
                id="custom-reason-text"
                label="Custom decline reason"
                fullWidth
                onChange={(e) => setCustomReason(e.target.value)}
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
