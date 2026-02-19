
import ClassWeekData from '../../db/models/ClassWeekData'

import { Router } from 'express'
import Lesson from '../../../db/Lesson'
import { scraperClient } from '../../../..'

const router = Router()

/** 
 * List all the class names
 * @returns Class list
*/
router.get('/list', async (_, res) => {
    try {
        // get data from db
        const find = await Lesson.findOne({ [`data`]: { $exists: true }, week: scraperClient.currentWeek })
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
router.get(`/all/currentweek`, async (_, res) => {
    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data`]: { $exists: true }, week: scraperClient.currentWeek })
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
router.get(`/all/upcomingweek`, async (_, res) => {
    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data`]: { $exists: true }, week: scraperClient.currentWeek + 1 })
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
router.get(`/all/week/:week`, async (req, res) => {
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
router.get('/:id/currentweek', async (req, res) => {
    // check params
    const { id } = req.params
    if (!id) return res.status(400).json({ success: false, data: 'Missing class id' })

    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data.${id}`]: { $exists: true }, week: scraperClient.currentWeek })
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
router.get('/:id/upcomingweek', async (req, res) => {
    // check params
    const { id } = req.params
    if (!id) return res.status(400).json({ success: false, data: 'Missing class id' })

    try {
        // get data from db
        const find = await ClassWeekData.findOne({ [`data.${id}`]: { $exists: true }, week: scraperClient.currentWeek + 1 })
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
router.get('/:id/week/:week', async (req, res) => {
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

export default router