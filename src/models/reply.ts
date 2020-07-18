import mongoose from 'mongoose'
import { IConfession } from './confession'
const Schema = mongoose.Schema

export interface IReply extends mongoose.Document {
	text: string
	alias: string
	embed: string
	auth: string
	authorized: boolean
	parentID: IConfession
	commentID: number
	status: number
	addedBy: string
	IPAdress: string
	remotePort: string
	createdAt: Date
	updatedAt: Date
}

const replySchema = new Schema({
	text: String,
	alias: String,
	embed: String,
	auth: String,
	authorized: { type: Boolean, default: false },
	parentID: { type: Schema.Types.ObjectId, ref: 'confessions' },
	commentID: Number,
	status: { type: Number, default: 0 },
	addedBy: String,
	IPAdress: String,
	remotePort: String,
}, { timestamps: true })

export default mongoose.model<IReply>('replies', replySchema)
