import HTTPClient from './HTTPClient';

export const ApiAddEntry = (confession: any) => HTTPClient.get(`/confessions/confession/${confession._id}/accept`);
export const ApiSetConfessionStatus = (confession: any, { status, note }:{ status: number, note?: string}) =>
  HTTPClient.put(`/confessions/confession/${confession._id}/status`, { status, note });
export const ApiDeleteEntry = (confession: any) => HTTPClient.delete(`/confessions/confession/${confession._id}`);
