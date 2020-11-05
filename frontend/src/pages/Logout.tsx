import { RouteComponentProps } from '@reach/router';
import { Dispatch, useContext } from 'react';
import { APIContext } from '../App';
import { absoluteNavigate } from '../components/AbsoluteLink';

export default function Logout(props: RouteComponentProps & {setUser: Dispatch<any>}) {
  const { setUser } = props;
  const { httpClient } = useContext(APIContext);
  httpClient.get('/users/logout')
    .then(() => absoluteNavigate('/index'))
    .then(() => {
      setUser(undefined);
    });
  return null;
}
