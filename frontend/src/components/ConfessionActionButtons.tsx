import React, { useState } from 'react';
import ActionButtons, { ActionButtonsProps } from './ActionButtons';
import ConfessionDeclineDialog from './ConfessionDeclineDialog';

export default function ConfessionActionButtons(props: ActionButtonsProps) {
  const { model, setStatusFn } = props;
  const [displayDeclineDialog, setDeclineDialogOpen] = useState(false);
  const longPressFn = () => {
    if (model.status === 0) setDeclineDialogOpen(true);
  };

  return (
    <>
      {displayDeclineDialog
      && (
      <ConfessionDeclineDialog
        confession={model}
        isOpen={displayDeclineDialog}
        setDeclineDialogOpen={setDeclineDialogOpen}
        setStatusFn={setStatusFn}
      />
      )}
      <ActionButtons {...props} longPressFn={longPressFn} />
    </>
  );
}
