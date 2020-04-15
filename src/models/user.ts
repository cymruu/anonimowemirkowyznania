import mongoose from 'mongoose'
const Schema = mongoose.Schema

const user = new Schema({
	username: String,
	password: String,
	avatar: String,
	userkey: String,
	flags: { type: Number, default: 0 },
})

export default mongoose.model('users', user)
