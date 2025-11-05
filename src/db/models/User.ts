
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('User', new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favoriteNumber: { type: Number, required: true }, // i thought this would be funny lmao
    role: { 
        type: String, 
        required: true, 
        default: "user", 
        enum: ["user", "manager", "admin"] 
    },
    createdAt: { type: Date, required: true, default: Date.now },
    apiKeyLimit: { type: Number, required: true, default: 2 }
}))