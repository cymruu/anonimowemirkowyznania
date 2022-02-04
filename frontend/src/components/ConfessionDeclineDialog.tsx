import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  FormControlLabel, FormLabel, Radio, RadioGroup, Snackbar, TextField,
} from '@mui/material';
import React, {
  Dispatch, SetStateAction, SyntheticEvent, useState,
} from 'react';
import { IConfession } from '../pages/Confessions';
import { ApiError } from '../service/HTTPClient';
import { setStatusFnT } from './ActionButtons';

export default function ConfessionDeclineDialog(
  {
    confession, isOpen, setDeclineDialogOpen, setStatusFn,
  }:
  {
    confession: IConfession,
    isOpen: boolean,
    setDeclineDialogOpen: Dispatch<SetStateAction<boolean>>,
    setStatusFn: setStatusFnT,
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
  const perdefinedReasons = ['Wpis może zostać dodany z twojego konta', 'Błędny link do obrazka'].map((x) => (
    <FormControlLabel value={x} control={<Radio />} label={x} />
  ));

  return (
    <>
      <Snackbar open={error.open} message={error.message} />
      <Dialog
        open={isOpen}
        onClose={() => setDeclineDialogOpen(false)}
      >
        <DialogTitle>Set confession decline reason</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <FormLabel component="legend">Select reason:</FormLabel>
            <RadioGroup name="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              {perdefinedReasons}
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
