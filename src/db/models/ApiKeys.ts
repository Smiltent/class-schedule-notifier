
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('ApiKeys', new Schema({
    owner: { type: String, required: true },
    key: { type: String, required: true }
}))