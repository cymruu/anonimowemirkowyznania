import mongoose from 'mongoose'
const Schema = mongoose.Schema

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

export default mongoose.model('conversations', conversationSchema)
