import { Link } from '@mui/material';
import React from 'react';

export default function ShortEmebed({ url }: {url: string}) {
  if (!url) return (null);
  let parsed;
  try {
    parsed = new URL(url);
  // eslint-disable-next-line no-empty
  } catch (err) {
    return (null);
  }
  return (
    <Link href={url} rel="noopener" target="_blank">
      {`${parsed.host}${parsed.pathname}`}
    </Link>
  );
}
