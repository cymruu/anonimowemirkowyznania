import mongoose from 'mongoose'
const Schema = mongoose.Schema

const archiveSchema = new Schema({
	item: Object,
})

export default mongoose.model('archives', archiveSchema)
