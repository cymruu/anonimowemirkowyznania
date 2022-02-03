import mongoose from 'mongoose'
const Schema = mongoose.Schema

export interface IArchive extends mongoose.Document {
	item: any
}

const archiveSchema = new Schema({
	item: Object,
})

export default mongoose.model<IArchive>('archives', archiveSchema)
