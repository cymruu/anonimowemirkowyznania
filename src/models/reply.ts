import mongoose from 'mongoose'
const Schema = mongoose.Schema

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
})

export default mongoose.model('replies', replySchema)
