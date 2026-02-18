
import mongoose, { Schema } from 'mongoose'

export default mongoose.model('User', new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favoriteNumber: { type: Number, required: true }, 
    permissions: { type: [ String ], required: true, default: [ 'basic' ]},
    createdAt: { type: Date, required: true, default: Date.now }
}))