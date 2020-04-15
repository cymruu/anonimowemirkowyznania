import mongoose from 'mongoose'
const Schema = mongoose.Schema

export interface ISurvey extends mongoose.Document {
	question: string
	answers: string[]
}

const surveySchema = new Schema({
	question: String,
	answers: [],
})

export default mongoose.model<ISurvey>('surveys', surveySchema)
