import { Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { APIContext } from '../App';
import { IConfession } from '../pages/Confessions';
import { noOpFn } from '../utils';

export default function ViewIPDialog({
  confession, open, onClose,
}: {confession: IConfession, open: boolean, onClose: ()=>void}) {
  const { apiClient } = useContext(APIContext);
  const [IpAddress, setIpAddres] = useState<string>('');
  useEffect(() => {
    apiClient.confessions.getIp(confession)
      .then((res) => {
        setIpAddres(res.IPAdress);
      })
      .catch(noOpFn);
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Confession was added from IP:
      </DialogTitle>
      <DialogContent>
        {IpAddress}
      </DialogContent>
    </Dialog>
  );
}
