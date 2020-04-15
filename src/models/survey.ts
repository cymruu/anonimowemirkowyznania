import mongoose from 'mongoose'
const Schema = mongoose.Schema

const surveySchema = new Schema({
	question: String,
	answers: [],
})

export default mongoose.model('surveys', surveySchema)
