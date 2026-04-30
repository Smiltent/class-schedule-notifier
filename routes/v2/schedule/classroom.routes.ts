
import Lesson from '@/models/Lesson'
import Week from '@/models/Week'

import { scraper } from '@/index'
import { Router } from 'express'
const router = Router()

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
/**
 * Helper functions
 */
async function getWeekId(week: string) {
    const data = await Week.findOne({ id: week })
    return data?._id ?? null
}

/** 
 * List all the class names
 * @returns Class list
*/
router.get('/list', async (_, res) => {
    try {
        // get data from db
        const week = await getWeekId(scraper.currentWeek)
        const classrooms = await Lesson.distinct('classroom', { week })

        const data = [...new Set(classrooms.flat())]
        // return data
        return res.json({
            success: true,
            data
        })
    } catch (err) {
        console.error(`Error listing all classrooms: ${err}`)
        return res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

/** 
 * Get class data for a specific week
 * @param id Class
 * @param week Week number
 * @returns Class data for that week
*/
router.get('/:classroom/week/:week', async (req, res) => {
    const { classroom, week } = req.params
    if (!classroom) return res.status(400).json({ success: false, data: 'Missing classroom' })
    if (!week) return res.status(400).json({ success: false, data: 'Missing week number' })

    try {
        const weekDoc = await Week.findOne({ id: week })
        if (!weekDoc) return res.status(404).json({ success: false, data: 'Week not found' }) 

        // get data from db
        const lessons = await Lesson.find({ week: weekDoc._id, classroom })
            .select('-_id -__v -week')
            .sort({ day: 1, period: 1 })

        if (!lessons.length) return res.status(404).json({ success: false, data: 'No data found for that week (not saved)' }) 

        // return data
        return res.json({
            success: true,
            lessons
        })
    } catch (err) {
        console.error(`Error fetching specific week (${week}) for classroom ${classroom}: ${err}`)
        return res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

export default router