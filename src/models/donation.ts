import mongoose, { Schema, Model } from 'mongoose'
import { IAd } from './ads'

export interface IDonation extends mongoose.Document {
	amount: number,
	added: boolean,
	from: string,
	message: string,
}
interface IDonationModel extends Model<IDonation> {
	totalInCurrentYear(): Promise<number>
	totalDonationSum(): Promise<number>
}
const donationSchema = new Schema({
	amount: { type: Number, required: true },
	added: { type: Boolean, default: false },
	from: String,
	message: String,
}, { timestamps: true })

donationSchema.statics.totalInCurrentYear = function(this: mongoose.Model<IDonation>) {
	const start = new Date(new Date().getFullYear(), 0, 1)
	const end = new Date(new Date().getFullYear(), 11, 31)
	return this.aggregate([ {
		$match: { createdAt: { '$gte': start, '$lte': end },
		},
	}, { $group:
		{ _id: null, sum: { $sum: '$amount' } },
	}]).then(res => res[0].sum)
}

donationSchema.statics.totalDonationSum = function(this: mongoose.Model<IDonation>) {
	return this.aggregate([{ $group:
		{ _id: null, sum: { $sum: '$amount' } },
	}]).then(res => res[0].sum)
}


export default mongoose.model<IDonation, IDonationModel>('dontaions', donationSchema)
