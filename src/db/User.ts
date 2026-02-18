
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('User', new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favoriteNumber: { type: Number, required: true }, 

    roles: { type: [ Schema.Types.ObjectId ], ref: "Role", required: true },
    
    createdAt: { type: Date, required: true, default: Date.now }
}))