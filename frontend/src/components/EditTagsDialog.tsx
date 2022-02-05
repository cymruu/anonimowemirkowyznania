import {
  Box,
  Chip, Dialog, DialogContent, DialogTitle,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import React, { useContext } from 'react';
import { APIContext } from '../App';
import { IConfession } from '../pages/Confessions';
import { noOpFn } from '../utils';

export default function EditTagsDialog({
  confession, tags, open, onClose, patchConfession,
}: {confession: IConfession, tags:any[], open: boolean, onClose: ()=>void, patchConfession: (response)=>void}) {
  const { apiClient } = useContext(APIContext);

  const updateTag = (tag: string, tagValue: boolean) => {
    apiClient.confessions.setTag(confession, { tag, tagValue })
      .then(async (res) => {
        patchConfession(res);
      }).catch(noOpFn);
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
      <DialogContent>
        {chips}
      </DialogContent>
    </Dialog>
  );
}
