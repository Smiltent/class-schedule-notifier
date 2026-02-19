
import mongoose, { Schema } from 'mongoose'
import Role from './Role'

export default mongoose.model('User', new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favoriteNumber: { type: Number, required: true }, 

    roles: [{ 
        type: Schema.Types.ObjectId, 
        ref: "Role", 
        required: true, 
        default: async () => {
            const role = await Role.findOne({ name: 'user' })
            return role ? role._id : null
        }
    }],
    
    createdAt: { type: Date, required: true, default: Date.now }
}))