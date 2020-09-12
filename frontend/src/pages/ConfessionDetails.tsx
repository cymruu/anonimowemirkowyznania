import { RouteComponentProps } from '@reach/router';
import React from 'react';

export default function (props: RouteComponentProps & {id: string}) {
  const { id } = props;

  return (
    <div>
      {id}
    </div>
  );
}
