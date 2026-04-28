
import Week from '@/models/Week'

import { scraper } from '@/index'
import { Router } from 'express'
const router = Router()

router.get('/list', async (_, res) => {
    try {
        // get data from db
        const weeks = await Week.find().select('id year dateFrom days -_id').sort({ dateFrom: 1 })

        // return data
        return res.json({
            success: true,
            currentWeek: scraper.currentWeek,
            data: weeks
        })
    } catch (err) {
        console.error(`Error listing all class names: ${err}`)
        return res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

export default router