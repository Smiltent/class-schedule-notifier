
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('Group', new Schema({
    name: { type: String, required: true },
    
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    users: { type: [Schema.Types.ObjectId], ref: "User", required: true }
}))