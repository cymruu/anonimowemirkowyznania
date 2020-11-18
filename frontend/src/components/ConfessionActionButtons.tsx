import React, { useState } from 'react';
import ActionButtons, { ActionButtonsProps } from './ActionButtons';
import ConfessionAcceptDialog from './ConfessionAcceptDialog';
import ConfessionDeclineDialog from './ConfessionDeclineDialog';

export default function ConfessionActionButtons(props: ActionButtonsProps) {
  const { model, setStatusFn, acceptFn } = props;
  const [displayAcceptDialog, setAcceptDialogOpen] = useState(false);
  const [displayDeclineDialog, setDeclineDialogOpen] = useState(false);
  const longPressAcceptFn = () => {
    if (model.status === 0) setAcceptDialogOpen(true);
  };
  const longPressDeclineFn = () => {
    if (model.status === 0) setDeclineDialogOpen(true);
  };

  return (
    <>
      {displayAcceptDialog
      && (
      <ConfessionAcceptDialog
        confession={model}
        isOpen={displayAcceptDialog}
        setAcceptDialogOpen={setAcceptDialogOpen}
        acceptFn={acceptFn}
      />
      )}
      {displayDeclineDialog
      && (
      <ConfessionDeclineDialog
        confession={model}
        isOpen={displayDeclineDialog}
        setDeclineDialogOpen={setDeclineDialogOpen}
        setStatusFn={setStatusFn}
      />
      )}
      <ActionButtons
        {...props}
        longPressDeclineFn={longPressDeclineFn}
        longPressAcceptFn={longPressAcceptFn}
      />
    </>
  );
}
