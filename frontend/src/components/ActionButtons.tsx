import { Button, CircularProgress, Grid } from '@material-ui/core';
import React, { useState } from 'react';
import SuccessButton from './SuccessButton';
import useLongPress from '../utils/longPress';
import ConfessionDeclineDialog from './ConfessionDeclineDialog';
import { toggleConfessionStatusFn } from '../pages/Confessions';

export type buttonActionFunction = (confession: any) => Promise<any>;
interface ActionButtonsProps {
    model: any
    acceptFn: buttonActionFunction
    setStatusFn: toggleConfessionStatusFn
    deleteFn: buttonActionFunction
}

const getRedButtonProps = (model: any, setStatusFn: toggleConfessionStatusFn, deleteFn: buttonActionFunction) => {
  switch (model.status) {
    case -1:
      return {
        text: 'Undecline',
        fn: setStatusFn,
      };
    case 0:
      return {
        text: 'Decline',
        fn: setStatusFn,
      };
    case 1:
      return {
        text: 'Remove',
        fn: deleteFn,
      };
    default:
      throw Error('Should never reach');
  }
};

export default function ActionButtons(props: ActionButtonsProps) {
  const [isSending, setSending] = useState(false);
  const [displayDeclineDialog, setDeclineDialogOpen] = useState(false);

  const {
    acceptFn, setStatusFn, deleteFn, model,
  } = props;

  const actionWrapper = (actionFn: Function, event: Event | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    return () => {
      setSending(true);
      actionFn(model)
        .then().finally(() => {
          setSending(false);
        });
    };
  };

  const longPressFn = () => {
    if (model.status === 0) setDeclineDialogOpen(true);
  };

  const { text, fn } = getRedButtonProps(model, setStatusFn, deleteFn);
  const longPressHook = useLongPress(longPressFn, (event) => actionWrapper(fn, event)());
  return (
    <>
      {displayDeclineDialog
      && (
      <ConfessionDeclineDialog
        confession={model}
        open={displayDeclineDialog}
        setDeclineDialogOpen={setDeclineDialogOpen}
        setStatusFn={setStatusFn}
      />
      )}
      <Grid container direction="column">
        <SuccessButton
          style={{ marginBottom: 5 }}
          disabled={isSending || model.status === 1}
          variant="contained"
          onClick={(e) => actionWrapper(acceptFn, e)()}
        >
          {isSending ? <CircularProgress size={24} /> : 'Accept'}
        </SuccessButton>
        <Button {...longPressHook} disabled={isSending} variant="contained" color="secondary">
          {isSending ? <CircularProgress size={24} /> : text}
        </Button>
      </Grid>
    </>
  );
}
