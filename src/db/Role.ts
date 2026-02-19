
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('Role', new Schema({
    name: { type: String, required: true, unique: true },
    permissions: [{ type: String, required: true, default: ['basic']}],
}))