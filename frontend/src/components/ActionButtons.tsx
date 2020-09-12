import { Button, CircularProgress, Grid } from '@material-ui/core';
import React, { useState } from 'react';
import SuccessButton from './SuccessButton';
import useLongPress from '../utils/longPress';
import ConfessionDeclineDialog from './ConfessionDeclineDialog';

export type buttonActionFunction = (confession: any) => Promise<any>;

interface ActionButtonsProps {
    confession: any
    acceptFn: buttonActionFunction
    setStatusFn: buttonActionFunction
    deleteFn: buttonActionFunction
}

const getRedButtonProps = (confession: any, setStatusFn: buttonActionFunction, deleteFn: buttonActionFunction) => {
  switch (confession.status) {
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

export function ActionButtons(props: ActionButtonsProps) {
  const [isSending, setSending] = useState(false);
  const [isDeclineDialogOpen, setDeclineDialogOpen] = useState(false);

  const {
    acceptFn, setStatusFn, deleteFn, confession,
  } = props;

  const actionWrapper = (actionFn: buttonActionFunction) =>
    (confessionObj: object, event: Event | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      setSending(true);
      actionFn(confessionObj)
        .then().finally(() => {
          setSending(false);
        });
    };

  const longPressFn = () => {
    if (confession.status === 0) setDeclineDialogOpen(true);
  };

  const { text, fn } = getRedButtonProps(confession, setStatusFn, deleteFn);
  const longPressHook = useLongPress(longPressFn, (event) => actionWrapper(fn)(confession, event));
  return (
    <>
      {isDeclineDialogOpen
      && (
      <ConfessionDeclineDialog
        confession={confession}
        open={isDeclineDialogOpen}
        setDeclineDialogOpen={setDeclineDialogOpen}
        setStatusFn={setStatusFn}
      />
      )}
      <Grid container direction="column">
        <SuccessButton
          disabled={isSending || confession.status === 1}
          variant="contained"
          onClick={(e) => actionWrapper(acceptFn)(confession, e)}
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
