import { Button, CircularProgress, Grid } from '@material-ui/core';
import React, { useState } from 'react';
import { IConfession } from '../pages/Confessions';
import { IReply } from '../pages/Replies';
import { noOpFn } from '../utils/index';
import useLongPress from '../utils/longPress';
import SuccessButton from './SuccessButton';

export type buttonActionFunction = (model: IConfession | IReply) => Promise<any>;
export type setStatusFnT = (model: IConfession | IReply, note?: string) => Promise<any>
export interface ActionButtonsProps {
    model: IConfession | IReply
    acceptFn: buttonActionFunction
    setStatusFn: setStatusFnT
    deleteFn: buttonActionFunction
    longPressFn?: ()=>void
}

const getRedButtonProps = (model: IConfession | IReply, setStatusFn: setStatusFnT, deleteFn: buttonActionFunction) => {
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

  const {
    acceptFn, setStatusFn, deleteFn, model, longPressFn,
  } = props;

  const actionWrapper = (
    actionFn: buttonActionFunction,
    event: Event | React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    return () => {
      setSending(true);
      actionFn(model)
        .finally(() => {
          setSending(false);
        });
    };
  };

  const { text, fn } = getRedButtonProps(model, setStatusFn, deleteFn);
  const longPressHook = useLongPress(longPressFn || noOpFn, (event) => actionWrapper(fn, event)());
  return (
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
  );
}
