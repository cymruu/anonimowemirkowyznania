import mongoose from 'mongoose'
import { IUser } from './user'
import { IConfession } from './confession'
const Schema = mongoose.Schema
interface IMessage {
	time: Date
	text: string
	IPAdress: string
	OP: boolean
	user?: IUser
}
export interface IConversation extends mongoose.Document {
	messages: IMessage[]
	parentID: IConfession
	userID: IUser
	//dynamicaly added in logic for displaying ISOP message
	auth: string
}

const conversationSchema = new Schema({
	messages: [
		{
			time: Date,
			text: String,
			IPAdress: { type: String, trim: true },
			OP: { type: Boolean, default: false },
			user: { type: Schema.Types.ObjectId, ref: 'users' },
		},
	],
	parentID: { type: Schema.Types.ObjectId, ref: 'confessions' },
	userID: { type: Schema.Types.ObjectId, ref: 'users' },
})

export default mongoose.model<IConversation>('conversations', conversationSchema)
