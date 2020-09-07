import { Dialog, DialogActions, DialogContent, DialogTitle, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField } from "@material-ui/core";
import React, { useState } from "react";

export function ConfessionDeclineDialog({open, handleClose}: {open: boolean, handleClose: () => void}){
  const [reason, setReason] = useState<string|null>(null)
  
  return (
        <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>Set confession decline reason</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <FormLabel component="legend">Select reason:</FormLabel>
              <RadioGroup name="reason" value={reason} onChange={e=>setReason(e.target.value)}>
                <FormControlLabel value="reason 1" control={<Radio />} label="Reason 1" />
                <FormControlLabel value="reason 2" control={<Radio />} label="Reason 2" />
                <FormControlLabel value="custom" control={<Radio />} label="Custom" />
                <TextField
                  disabled={reason!=='custom'}
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
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Decline with reason: {reason}
          </Button>
        </DialogActions>
      </Dialog>
    )
}