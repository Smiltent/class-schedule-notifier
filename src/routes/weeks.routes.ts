
import TeacherWeekData from '../db/models/TeacherWeekData'
import RawScheduleData from '../db/models/RawScheduleData'
import ClassWeekData from '../db/models/ClassWeekData'

import rateLimit from "express-rate-limit"
import { scraperClient } from '../..'
import { Router } from 'express'

const router = Router()

const API_RATELIMIT = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    limit: 20,
    handler: (_, res) => {
        res.status(429).render("error")
    }
})

/** 
 * List all the week numbers
 * @returns Week numbers
*/
router.get('/list', API_RATELIMIT, async (_, res) => {
    try {
        const weeks = await RawScheduleData.distinct('week')
        const currentWeek = scraperClient.current_week

        res.json({ success: true, currentWeek, weeks })
    } catch (err) {
        console.error(`Error fetching weeks: ${err}`)
        res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

/** 
 * List all the class names
 * @returns Class list
*/
router.get('/class/list', API_RATELIMIT, async (_, res) => {
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
        return res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

/** 
 * List all the classes for the current week
 * @returns Classes list for every class for the current week
*/
router.get(`/class/all/currentweek`, async (_, res) => {
    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data`]: { $exists: true }, week: scraperClient.current_week })
        const data = find?.data

        // return data
        return res.json({
            success: true,
            data
        })
    } catch (err) {
        console.error(`Error fetching current week for all classes: ${err}`)
        return res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

/** 
 * List all the classes for the upcoming week
 * @returns Classes list for every class for the upcoming week
*/
router.get(`/class/all/upcomingweek`, async (_, res) => {
    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data`]: { $exists: true }, week: scraperClient.current_week + 1 })
        const data = find?.data

        // if data not found, return 404
        if (!data) return res.status(404).json({ success: false, data: 'No data found for upcoming week (not released)' })

        // return data
        return res.json({
            success: true,
            data
        })
    } catch (err) {
        console.error(`Error fetching upcoming week for all classes: ${err}`)
        return res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

/** 
 * List all the classes for the current week
 * @param week Week number
 * @returns Classes list for every class for a specific week
*/
router.get(`/class/all/week/:week`, async (req, res) => {
    const { week } = req.params
    if (!week) return res.status(400).json({ success: false, data: 'Missing week number' })

    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data`]: { $exists: true }, week })
        const data = find?.data

        // if data not found, return 404
        if (!data) return res.status(404).json({ success: false, data: 'No data found for that week (not saved)' })

        // return data
        return res.json({
            success: true,
            data
        })
    } catch (err) {
        console.error(`Error fetching specific week (${week}) for all classes: ${err}`)
        return res.status(500).json({ success: false, data: 'Internal Server Error' })
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
    if (!id) return res.status(400).json({ success: false, data: 'Missing class id' })

    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data.${id}`]: { $exists: true }, week: scraperClient.current_week })
        const data = find?.data[id]

        // if data not found, return 404
        if (!data) return res.status(404).json({ success: false, data: 'No data found for current week' })

        // return data
        return res.json({
            success: true,
            data
        })
    } catch (err) {
        console.error(`Error fetching current week for class ${id}: ${err}`)
        return res.status(500).json({ success: false, data: 'Internal Server Error' })
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
    if (!id) return res.status(400).json({ success: false, data: 'Missing class id' })

    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data.${id}`]: { $exists: true }, week: scraperClient.current_week + 1 })
        const data = find?.data[id]

        // if data not found, return 404
        if (!data) return res.status(404).json({ success: false, data: 'No data found for upcoming week (not released)' })

        // return data
        return res.json({
            success: true,
            data
        })
    } catch (err) {
        console.error(`Error fetching upcoming week for class ${id}: ${err}`)
        return res.status(500).json({ success: false, data: 'Internal Server Error' })
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
    if (!id) return res.status(400).json({ success: false, data: 'Missing class id' })
    if (!week) return res.status(400).json({ success: false, data: 'Missing week number' })

    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data.${id}`]: { $exists: true }, week })
        const data = find?.data[id]

        // if data not found, return 404
        if (!data) return res.status(404).json({ success: false, data: 'No data found for that week (not saved)' })

        // return data
        return res.json({
            success: true,
            data
        })
    } catch (err) {
        console.error(`Error fetching specific week (${week}) for class ${id}: ${err}`)
        return res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

/** 
 * List all the teachers
 * @returns Array of all the teachers names
*/
router.get('/teacher/list', async (_, res) => {
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