import {
  Box,
  Chip, Dialog, DialogTitle,
} from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import React, { useContext } from 'react';
import { APIContext } from '../App';

export default function EditTagsDialog({
  confession, tags, open, onClose, patchConfession,
}: {confession:any, tags:any[], open:boolean, onClose: ()=>void, patchConfession: (response)=>void}) {
  const { apiClient } = useContext(APIContext);

  const updateTag = (tag:string, tagValue: boolean) => {
    apiClient.confessions.setTag(confession, { tag, tagValue })
      .then(async (res) => {
        patchConfession(res);
      });
  };

  const chips = tags?.map(([tag, value]) => (
    <Box m={1} key={tag}>
      <Chip
        color={value ? 'primary' : 'secondary'}
        label={tag}
        onClick={() => updateTag(tag, !value)}
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
