import React, { useState, useEffect, useReducer } from 'react';
import { TablePagination } from '@mui/material';
import { replaceInArray } from '../utils';

type PageResponse = { pageItems: any[], count: number }
type GetPageFunction = (page: number, perPage: number) => Promise<PageResponse>

type PaginationReducerAction =
  | { type: 'set', page: PageResponse }
  | { type: 'replace', id: string, patchObject: object }

function paginationReducer(state: PageResponse, action: PaginationReducerAction) {
  switch (action.type) {
    case 'set':
      return action.page;
    case 'replace':
      return {
        ...state,
        pageItems: replaceInArray(state.pageItems, action.id, action.patchObject),
      };
    default: return state;
  }
}

export default function usePagination(getPage: GetPageFunction) {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [data, setData] = useReducer(paginationReducer, { pageItems: [], count: 0 });

  const [isLoading, setIsLoading] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    setIsLoading(true);
    getPage(page, perPage)
      .then((pageResponse) => {
        setData({ type: 'set', page: pageResponse });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [getPage, page, perPage]);
  const paginationComponent =
    data.pageItems.length ? (
      <TablePagination
        component="div"
        rowsPerPageOptions={[25, 50, 100]}
        count={data.count}
        rowsPerPage={perPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    ) : null;

  return {
    paginationComponent, isLoading, data: data.pageItems, setData,
  };
}
