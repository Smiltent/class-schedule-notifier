
import { scraperClient } from '../..'
import ClassWeekData from '../db/models/ClassWeekData'
import RawScheduleData from '../db/models/RawScheduleData'

import { Router } from 'express'
import TeacherWeekData from '../db/models/TeacherWeekData'
const router = Router()

/** 
 * List all the week numbers
 * @returns Class data for the current week
*/
router.get('/list', async (req, res) => {
    try {
        const weeks = await RawScheduleData.distinct('week')
        const currentWeek = scraperClient.current_week

        res.json({ success: true, currentWeek, weeks })
    } catch (err) {
        console.error(`Error fetching weeks: ${err}`)
        res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
})

router.get('/class/list', async (req, res) => {
    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data`]: { $exists: true }, week: scraperClient.current_week })
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

/** 
 * Get class data for the current week (the current week)
 * @param id Class ID
 * @returns Class data for the current week
*/
router.get('/class/:id/currentweek', async (req, res) => {
    // check params
    const { id } = req.params
    if (!id) return res.status(400).json({ success: false, message: 'Missing class id' })

    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data.${id}`]: { $exists: true }, week: scraperClient.current_week })
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

/** 
 * Get class data for the upcoming week (if released)
 * @param id Class ID
 * @returns Class data for the upcoming week
*/
router.get('/class/:id/upcomingweek', async (req, res) => {
    // check params
    const { id } = req.params
    if (!id) return res.status(400).json({ success: false, message: 'Missing class id' })

    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data.${id}`]: { $exists: true }, week: scraperClient.current_week + 1})
        const data = find?.data[id]

        // if data not found, return 404
        if (!data) return res.status(404).json({ success: false, message: 'No data found for upcoming week (not released)' })

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


/** 
 * Get class data for a specific week
 * @param id Class ID
 * @param week Week number
 * @returns Class data for that week
*/
router.get('/class/:id/week/:week', async (req, res) => {
    const { id, week } = req.params
    if (!id) return res.status(400).json({ success: false, message: 'Missing class id' })
    if (!week) return res.status(400).json({ success: false, message: 'Missing week number' })

    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data.${id}`]: { $exists: true }, week })
        const data = find?.data[id]

        // if data not found, return 404
        if (!data) return res.status(404).json({ success: false, message: 'No data found for that week (not saved)' })

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

/** 
 * List all the teachers
 * @returns Array of all the teachers names
*/
router.get('/teacher/list', async (req, res) => {
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
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
})

// router.get('/teacher/:id/currentweek', async (req, res) => {
//     // check params
//     const { id } = req.params
//     if (!id) return res.status(400).json({ success: false, message: 'Missing class id' })

//     try {
//         // get data from db
//         const find = await TeacherWeekData.findOne({ [`data.${id}`]: { $exists: true }, week: scraperClient.current_week })
//         const data = find?.data[id]

//         // if data not found, return 404
//         if (!data) return res.status(404).json({ success: false, message: 'No data found for upcoming week (not released)' })

//         // return data
//         return res.json({
//             success: true,
//             data
//         })
//     } catch (err) {
//         console.error(`Error fetching current teach for teacher ${id}: ${err}`)
//         return res.status(500).json({ success: false, message: 'Internal Server Error' })
//     }
// })

// router.get('/teacher/:id/upcomingweek', async (req, res) => {
//     const { id } = req.params
// })

// router.get('/teacher/:id/week/:week', (req, res) => {
//     const { id, week } = req.params
// })

// // ===========================================================

export default router