
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('TeacherWeekData', new Schema({
    week: { type: String, required: true },
    teacherId: { type: String, required: true },
    teacherName: { type: String, required: false },
    data: { type: Schema.Types.Mixed, required: true }
}))