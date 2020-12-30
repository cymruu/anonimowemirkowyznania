import React, { useState, useEffect, useMemo } from 'react';

type PageResponse = {pageItems: any[], count: number}
type GetPageFunction = (page: number, perPage: number)=>Promise<PageResponse>

export default function usePagination(getPage: GetPageFunction) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [data, setData] = useState<PageResponse>({ pageItems: [], count: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('load page changed', page, perPage);
    getPage(page, perPage).then((pageResponse) => {
      console.log(pageResponse);
      setData(pageResponse);
    });
  }, [getPage, page, perPage]);
  const paginationComponent = (
    <div>
      {page}
      ,
      {perPage}
    </div>
  );
  return paginationComponent;
}
