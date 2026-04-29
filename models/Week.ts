
import mongoose, { Schema } from 'mongoose'

const WeekSchema = new Schema({
    id: { type: String, required: true, unique: true },
    year: { type: String, required: true },
    
    days: [{ type: String, required: true }],

    dateFrom: { type: String, required: true }
})

WeekSchema.index({ id: 1 }, { unique: true })

export default mongoose.model('Week', WeekSchema)