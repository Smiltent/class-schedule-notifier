
import mongoose, { Schema } from 'mongoose'

// I realised, I need to parse over the old schema to the new one
// export default mongoose.model('RawScheduleData', new Schema({
//     week: { type: Schema.Types.ObjectId, ref: "Week", required: true },
//     data: { type: Schema.Types.Mixed, required: true }
// }))

// But this works fine... for now...
export default mongoose.model('RawScheduleData', new Schema({
    week: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true }
}))