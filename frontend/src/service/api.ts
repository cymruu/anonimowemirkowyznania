import { IConfession } from '../pages/Confessions';
import { IReply } from '../pages/Replies';
import HTTPClient from './HTTPClient';

export const ApiAddEntry = (confession: IConfession) => HTTPClient.get(`/confessions/confession/${confession._id}/accept`);
export const ApiSetConfessionStatus = (confession: IConfession, { status, note }:{ status: number, note?: string}) =>
  HTTPClient.put(`/confessions/confession/${confession._id}/status`, { status, note });
export const ApiDeleteConfession = (confession: IConfession) => HTTPClient.delete(`/confessions/confession/${confession._id}`);
export const ApiUpdateConfessionTag = (confession: IConfession, { tag, tagValue }: {tag: string, tagValue: boolean}) =>
  HTTPClient.put(`/confessions/confession/${confession._id}/tags`, { tag, tagValue });

export const ApiAddReply = (reply: IReply) => HTTPClient.get(`/replies/reply/${reply._id}/accept`);
export const ApiSetReplyStatus = (reply: IReply, { status, note }:{ status: number, note?: string}) =>
  HTTPClient.put(`/replies/reply/${reply._id}/status`, { status, note });
export const ApiDeleteReply = (reply: IReply) => HTTPClient.delete(`/replies/reply/${reply._id}`);
