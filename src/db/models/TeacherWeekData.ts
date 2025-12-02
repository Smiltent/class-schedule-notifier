
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('TeacherWeekData', new Schema({
    week: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true }
}))