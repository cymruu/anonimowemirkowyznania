import {
  Box, Chip, Container, Typography,
} from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';
import React, { useContext, useEffect, useState } from 'react';
import ClearIcon from '@material-ui/icons/Clear';
import DoneIcon from '@material-ui/icons/Done';
import { APIContext } from '../App';
import { noOpFn, replaceInArray } from '../utils';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Permissions(props: RouteComponentProps) {
  const { httpClient } = useContext(APIContext);
  const [mods, setMods] = useState<any[]>([]);

  const setPermission = (user: any, permission: string) =>
    httpClient.put(`/users/${user._id}/setPermission`, { permission })
      .then((res) => {
        setMods(replaceInArray(mods, user._id, res.patchObject));
      })
      .catch(noOpFn);

  useEffect(() => {
    httpClient.swallow(httpClient.get('/users'))
      .then((fetchedMods) => {
        setMods(fetchedMods);
      }).catch(noOpFn);
  }, [httpClient, setMods]);
  const modList = mods.map((mod) => {
    const permissionChips = Object.entries(mod.permissions)
      .map(([permission, value]) => (
        <Box m={1} key={permission}>
          <Chip
            color={value ? 'primary' : 'secondary'}
            label={permission}
            onClick={() => setPermission(mod, permission)}
            icon={value ? <DoneIcon /> : <ClearIcon />}
          />
        </Box>
      ));
    return (
      <Box key={mod.username}>
        <Typography variant="subtitle1">{mod.username}</Typography>
        {permissionChips}
      </Box>
    );
  });
  return (<Container>{modList}</Container>);
}
