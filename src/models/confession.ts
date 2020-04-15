import mongoose from 'mongoose'
import { IAction } from './action'
const Schema = mongoose.Schema

export interface IConfession extends mongoose.Document {
	text: string
	embed: string
	auth: string
	tags: string[]
	entryID: number
	status: number
	addedBy:string
	notificationCommentId: number
	IPAdress: string
	remotePort: string
	actions: IAction[]
	converations: any[]
	survey: string
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
	notificationCommentId: Number,
	IPAdress: String,
	remotePort: String,
	actions: [{ type: Schema.Types.ObjectId, ref: 'actions' }],
	conversations: [{ type: Schema.Types.ObjectId, ref: 'conversations' }],
	survey: { type: Schema.Types.ObjectId, ref: 'surveys' },
}, { timestamps: true })

export default mongoose.model<IConfession>('confessions', confessionSchema)
