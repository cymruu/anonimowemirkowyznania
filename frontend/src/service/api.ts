import HTTPClient from './HTTPClient';

export const ApiAddEntry = (confession: any) => HTTPClient.get(`/confessions/confession/${confession._id}/accept`);
export const ApiSetConfessionStatus = (confession: any, status: number) =>
  HTTPClient.put(`/confessions/confession/${confession._id}/status`, { status });
export const ApiDeleteEntry = (confession: any) => HTTPClient.delete(`/confessions/confession/${confession._id}`);
