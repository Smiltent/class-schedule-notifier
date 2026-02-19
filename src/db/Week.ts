
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('Week', new Schema({
    // yes, they are a string, it's easier for me....
    id: { type: String, required: true },
    year: { type: String, required: true },

    dateFrom: { type: String, required: true }
}))