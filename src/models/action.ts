import mongoose from 'mongoose'
const Schema = mongoose.Schema

export interface IAction extends mongoose.Document {
	action: string,
	note: string,
	type: number,
	time: Date,
}

const actionSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'users' },
	action: String,
	note: String,
	type: Number,
	time: Date,
})

export default mongoose.model<IAction>('actions', actionSchema)
