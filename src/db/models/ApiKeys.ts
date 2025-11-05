
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('ApiKeys', new Schema({
    owner: { type: String, required: true },
    key: { type: String, required: true },
    name: { type: String, required: true },
    corsDomain: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now }
}))