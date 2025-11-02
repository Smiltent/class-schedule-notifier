
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('User', new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        required: true, 
        default: "user", 
        enum: ["user", "manager", "admin"] 
    }
}))