
import mongoose, { Schema } from 'mongoose'

/**
 * @deprecated In favor for new Schemas
 */
export default mongoose.model('TeacherWeekData', new Schema({
    week: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true }
}))