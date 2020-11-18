import {
  Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  FormControlLabel, FormGroup, FormLabel,
} from '@material-ui/core';
import React, {
  Dispatch, SetStateAction, SyntheticEvent, useState,
} from 'react';
import { IConfession } from '../pages/Confessions';
import { AcceptConfessionOptions } from '../service/api';

export default function ConfessionAcceptDialog(
  {
    confession, isOpen, setAcceptDialogOpen, acceptFn,
  }:
  {
    confession: IConfession,
    isOpen: boolean,
    setAcceptDialogOpen: Dispatch<SetStateAction<boolean>>,
    acceptFn: any,
  },
) {
  const [state, setState] = useState<AcceptConfessionOptions>({
    includeEmbed: true,
    includeSurvey: true,
    isPlus18: false,
  });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };
  const acceptWrapped = (event: SyntheticEvent) => {
    event.preventDefault();
    console.log(state);

    return acceptFn(confession, state).then(() => {
      setAcceptDialogOpen(false);
    });
  };
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => setAcceptDialogOpen(false)}
      >
        <DialogTitle>Advanced accept</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <FormLabel component="legend">Options:</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={state.includeEmbed} onChange={handleChange} name="includeEmbed" />}
                label="Include embed"
              />
              <FormControlLabel
                control={<Checkbox checked={state.includeSurvey} onChange={handleChange} name="includeSurvey" />}
                label="Include survey"
              />
              <FormControlLabel
                control={<Checkbox checked={state.isPlus18} onChange={handleChange} name="isPlus18" />}
                label="Is NSFW"
              />
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptDialogOpen(false)} color="primary">
            Close
          </Button>
          <Button color="primary" autoFocus onClick={acceptWrapped}>
            Accept confession
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
