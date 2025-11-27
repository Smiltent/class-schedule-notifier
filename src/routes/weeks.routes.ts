
import ClassWeekData from '../db/models/ClassWeekData'
import RawScheduleData from '../db/models/RawScheduleData'
import { apiAuth } from '../middlewares/auth.middleware'

import { Router } from 'express'
const router = Router()

// ===========================================================
router.get('/listWeeks', apiAuth, (req, res) => {
    const weeks = RawScheduleData.distinct('week')

    res.json({ success: true, weeks })
})

// ===========================================================
router.get('/class/list', apiAuth, async (req, res) => {
    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data`]: { $exists: true }, week: 64 })
        const data = Object.keys(find?.data || {})

        // return data
        return res.json({
            success: true,
            data
        })
    } catch (err) {
        console.error(`Error listing all class names: ${err}`)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
})

router.get('/class/:id/currentweek', apiAuth, async (req, res) => {
    // check params
    const { id } = req.params
    if (!id) return res.status(400).json({ success: false, message: 'Missing class id' })

    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data.${id}`]: { $exists: true }, week: 64 })
        const data = find?.data[id]

        // if data not found, return 404
        if (!data) return res.status(404).json({ success: false, message: 'No data found for current week' })

        // return data
        return res.json({
            success: true,
            data
        })
    } catch (err) {
        console.error(`Error fetching current week for class ${id}: ${err}`)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
})

router.get('/class/:id/upcomingweek', apiAuth, (req, res) => {
    const { id } = req.params
})

router.get('/class/:id/week/:week', apiAuth, (req, res) => {
    const { id, week } = req.params
})

// ===========================================================
router.get('/teacher/list', apiAuth, (req, res) => {
    
})

router.get('/teacher/:id/currentweek', apiAuth, (req, res) => {
    const { id } = req.params
})

router.get('/teacher/:id/upcomingweek', apiAuth, (req, res) => {
    const { id } = req.params
})

router.get('/teacher/:id/week/:week', apiAuth, (req, res) => {
    const { id, week } = req.params
})

// ===========================================================

export default router