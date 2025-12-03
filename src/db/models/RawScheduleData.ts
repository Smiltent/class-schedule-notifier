
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('RawScheduleData', new Schema({
    week: { type: String, required: true },
    text: { type: String, required: true },
    dateFrom: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true }
}))