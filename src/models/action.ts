import mongoose from 'mongoose'
const Schema = mongoose.Schema

const actionSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'users' },
	action: String,
	note: String,
	type: Number,
	time: Date,
})

export default mongoose.model('actions', actionSchema)
