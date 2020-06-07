import mongoose, { Schema } from 'mongoose'

export interface IDonationIntent extends mongoose.Document {
	intentId: string,
	email: string,
	username: string,
	message: string,
	amount: number,
}
const donationIntentSchema = new Schema({
	intentId: String,
	email: String,
	username: String,
	message: String,
	amount: Number,
}, { timestamps: true })


export default mongoose.model<IDonationIntent>('donationIntents', donationIntentSchema)
