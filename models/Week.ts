
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('Week', new Schema({
    id: { type: String, required: true },
    year: { type: String, required: true },

    dateFrom: { type: String, required: true }
}))