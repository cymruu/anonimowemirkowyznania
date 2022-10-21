import { Dispatch, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { APIContext } from '../App';
export default function Logout(props: { setUser: Dispatch<any> }) {
  const { setUser } = props;
  const navigate = useNavigate()
  const { httpClient } = useContext(APIContext);
  httpClient.get('/users/logout')
    .then(() => navigate('/index'))
    .then(() => {
      setUser(undefined);
    });
  return null;
}
