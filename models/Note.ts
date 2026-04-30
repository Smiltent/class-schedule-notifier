
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('Note', new Schema({    
    type: { type: String, required: true, enum: ['personal', 'group'] },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },

    user: { type: Schema.Types.ObjectId, ref: "User" },
    group: { type: Schema.Types.ObjectId, ref: "Group" },

    content: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now }
}))