import mongoose, { Model } from 'mongoose'
const Schema = mongoose.Schema
interface IVisit {
	IPAdress: string,
	time?: Date,
	from: string
}
export interface IAd extends mongoose.Document {
	name: string
	captions: string[]
	active: boolean
	visits: IVisit[]
	out: string
}

interface IAdModel extends Model<IAd> {
	random(): Promise<IAd>
}


const advertismentSchema = new Schema({
	name: String,
	captions: [String],
	active: Boolean,
	visits: [
		{
			IPAdress: String,
			time: { type: Date, default: Date.now },
			from: { type: Schema.Types.ObjectId, ref: 'confessions' },
		}, { _id: false },
	],
	out: String,
})

advertismentSchema.statics.random = function(): Promise<IAd> {
	return this.countDocuments({ active: true }).then(count => {
		const rand = Math.floor(Math.random() * count)
		return this.findOne({ active: true }, 'name captions out').skip(rand)
	})
}
export default mongoose.model<IAd, IAdModel>('advertisments', advertismentSchema)
