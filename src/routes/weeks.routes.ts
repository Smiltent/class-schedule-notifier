
import RawScheduleData from '../db/models/RawScheduleData'

import classRouter from './weeks/class.subroutes'
import teacherRouter from './weeks/teacher.subroutes'

import { scraperClient } from '../..'
import { Router } from 'express'

const router = Router()

/** 
 * List all the week numbers
 * @returns Week numbers
*/
router.get('/list', async (_, res) => {
    try {
        const weeks = await RawScheduleData.distinct('week')
        const currentWeek = scraperClient.current_week

        res.json({ success: true, currentWeek, weeks })
    } catch (err) {
        console.error(`Error fetching weeks: ${err}`)
        res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

router.use('/class', classRouter)
router.use('/teacher', teacherRouter)

export default router