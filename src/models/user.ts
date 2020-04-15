import * as mongoose from 'mongoose'
const Schema = mongoose.Schema

export interface IUser extends mongoose.Document {
	username: string
	password: string
	avatar: string
	userkey: string
	flags: number
}

const user = new Schema({
	username: String,
	password: String,
	avatar: String,
	userkey: String,
	flags: { type: Number, default: 0 },
})

export default mongoose.model<IUser>('users', user)
