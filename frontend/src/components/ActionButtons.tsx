import { Button, CircularProgress, Grid } from '@mui/material';
import React, { useState } from 'react';
import { IConfession } from '../pages/Confessions';
import { IReply } from '../pages/Replies';
import theme from '../theme';
import { noOpFn } from '../utils/index';
import useLongPress from '../utils/longPress';

export type buttonActionFunction = (model: IConfession | IReply) => Promise<any>;
export type setStatusFnT = (model: IConfession | IReply, note?: string) => Promise<any>
export interface ActionButtonsProps {
  model: IConfession | IReply
  acceptFn: buttonActionFunction
  setStatusFn: setStatusFnT
  deleteFn: buttonActionFunction
  longPressDeclineFn?: () => void
  longPressAcceptFn?: () => void
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
    acceptFn, setStatusFn, deleteFn, model,
    longPressDeclineFn, longPressAcceptFn,
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
  const longPressAcceptHook = useLongPress(longPressAcceptFn || noOpFn, (event) => actionWrapper(acceptFn, event)());
  const longPressDeclineHook = useLongPress(longPressDeclineFn || noOpFn, (event) => actionWrapper(fn, event)());
  return (
    <Grid container direction="column">
      <Button
        color='success'
        disabled={isSending || model.status !== 0}
        variant="contained"
        sx={{ marginBottom: 1 }}
        {...longPressAcceptHook}
      >
        {isSending ? <CircularProgress size={24} /> : 'Accept'}
      </Button>
      <Button {...longPressDeclineHook} disabled={isSending} variant="contained" color='error'>
        {isSending ? <CircularProgress size={24} /> : text}
      </Button>
    </Grid>
  );
}
