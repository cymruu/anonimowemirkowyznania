import {
  Box, Dialog, DialogContent, DialogTitle,
} from '@material-ui/core';
import { Close as CloseIcon, HourglassEmpty as HourglassEmptyIcon, Check as CheckIcon } from '@material-ui/icons';
import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from '@reach/router';
import { APIContext } from '../App';
import { IConfession } from '../pages/Confessions';
import { noOpFn } from '../utils';
import { AbsoluteLink } from './AbsoluteLink';

export default function ViewIPDialog({
  confession, open, onClose,
}: {confession: IConfession, open: boolean, onClose: ()=>void}) {
  const { apiClient } = useContext(APIContext);
  const [confessions, setConfessions] = useState<IConfession[]>([]);
  useEffect(() => {
    if (open) {
      apiClient.confessions.getFromIp(confession)
        .then((res) => {
          setConfessions(res.confessions);
        })
        .catch(noOpFn);
    }
  }, [apiClient, confession, open]);

  const getIcon = (status: number) => {
    switch (status) {
      case 0: return <HourglassEmptyIcon />;
      case 1: return <CheckIcon />;
      case -1: return <CloseIcon />;
      default: return null;
    }
  };

  const confessionList = confessions.map((x) => (
    <Box m={1} key={x._id}>
      <AbsoluteLink component={RouterLink} to={`/confessions/${x._id}`} onClick={onClose}>
        {x._id}
      </AbsoluteLink>
      {getIcon(x.status)}
    </Box>
  ));

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Other confessions added from this IP:
      </DialogTitle>
      <DialogContent>
        {confessionList}
      </DialogContent>
    </Dialog>
  );
}
