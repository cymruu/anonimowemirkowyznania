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
	random(cb)
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

advertismentSchema.statics.random = function(callback) {
	this.count({ active: true }, function(err, count) {
		if (err) {
			return callback(err)
		}
		const rand = Math.floor(Math.random() * count)
		this.findOne({ active: true }, 'name captions out').skip(rand).exec(callback)
	}.bind(this))
}
export default mongoose.model<IAd, IAdModel>('advertisments', advertismentSchema)
