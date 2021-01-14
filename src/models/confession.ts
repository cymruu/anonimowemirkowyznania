import mongoose from 'mongoose'
import { IAction } from './action'
import { ISurvey } from './survey'
const Schema = mongoose.Schema

export enum ConfessionStatus {
	DECLINED = -1,
	WAITING,
	ACCEPTED,
}

export interface IConfession extends mongoose.Document {
	text: string
	embed: string
	auth: string
	tags: [string, number][]
	entryID: number
	status: number
	addedBy: string
	IPAdress: string
	remotePort: string
	actions: IAction[]
	converations: any[]
	survey: string|ISurvey
	createdAt: Date
	updatedAt: Date
}

const confessionSchema = new Schema({
	text: String,
	embed: String,
	auth: String,
	tags: [],
	entryID: Number,
	status: { type: Number, default: 0 },
	addedBy: String,
	IPAdress: String,
	remotePort: String,
	actions: [{ type: Schema.Types.ObjectId, ref: 'actions' }],
	conversations: [{ type: Schema.Types.ObjectId, ref: 'conversations' }],
	//TODO: it does not need to be referenced document - confession can store survey as property
	survey: { type: Schema.Types.ObjectId, ref: 'surveys' },
}, { timestamps: true })

export default mongoose.model<IConfession>('confessions', confessionSchema)
