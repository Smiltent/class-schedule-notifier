
import TeacherWeekData from '../../db/models/TeacherWeekData'

import { scraperClient } from '../../..'
import { Router } from 'express'

const router = Router()

/** 
 * List all the teachers
 * @returns Array of all the teachers names
*/
router.get('/list', async (_, res) => {
    try {
        // get data from db
        const find = await TeacherWeekData.findOne({ [`data`]: { $exists: true }, week: scraperClient.current_week })
        const data = Object.keys(find?.data || {})

        // return data
        return res.json({
            success: true,
            data
        })
    } catch (err) {
        console.error(`Error listing all Teacher names: ${err}`)
        return res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

export default router