
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('Lesson', new Schema({
    week: { type: Schema.Types.ObjectId, ref: "Week", required: true },
    day: { type: String, required: true },            // 1, 2, 3, 4, 5, 6, 7

    period: { type: Number, required: true },         // 1, 2, 3, 4
    classroom: { type: String, required: true },      // P.203, C.201
    name: { type: String, required: true },           // Math

    class: [{ type: String, required: true }],        // IP24, IP25, IP26...
    group: [{ type: String, required: true }],        // 1, 2, 3 ...

    teachers: [{ type: String, required: true }]       // John Lemon
}))