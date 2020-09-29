import {
  Box,
  Chip, Dialog, DialogTitle,
} from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import React from 'react';

export default function EditTagsDialog({ tags, open, onClose }: {tags:any[], open:boolean, onClose: ()=>void}) {
  const chips = tags?.map(([tag, value]) => (
    <Box m={1} key={tag}>
      <Chip
        color={value ? 'primary' : 'secondary'}
        label={tag}
        onClick={() => null}
        icon={value ? <DoneIcon /> : <ClearIcon />}
      />
    </Box>
  ));
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Edit tags
      </DialogTitle>
      {chips}
    </Dialog>
  );
}
