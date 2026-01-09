
import { del, list, modify, register } from "../services/auth.service"
import { userAuth, requireRole } from "../middlewares/auth.middleware"
import { scraperClient, webserverClient } from "../.."

import { Router } from 'express'
const router = Router()

// ===========================================================
router.post(`/user/create`, userAuth, requireRole('admin'), async (req, res) => {
    const { username, password, favoriteNumber, role } = req.body

    if (!username) return res.status(400).json({ success: false, data: 'Missing required fields' })
    if (!password) return res.status(400).json({ success: false, data: 'Password cannot be empty' })
    if (!favoriteNumber) return res.status(400).json({ success: false, data: 'Favorite number cannot be empty' })
    if (!role) return res.status(400).json({ success: false, data: 'Role cannot be empty' })

    try {
        await register(username, password, favoriteNumber, role)
        
        res.status(400).render("admin/index", { dMsg: "created account!", dType: "good"} )
    } catch (err) {
        console.error(`User creation error: ${err}`)
        res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

router.delete(`/user/delete`, userAuth, requireRole('admin'), async (req, res) => {
    const { username } = req.body

    try {
        await del(username)

        res.status(400).render("admin/index", { dMsg: "deleted account!", dType: "good"} )
    } catch (err) {
        console.error(`User delete error: ${err}`)
        res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

router.post(`/user/modify`, userAuth, requireRole('admin'), async (req, res) => {
    const { ogUsername, username, favoriteNumber, role } = req.body

    try {
        await modify(ogUsername, { username, favoriteNumber, role })

        res.status(400).render("admin/index", { dMsg: "modified account!", dType: "good"} )
    } catch (err) {
        console.error(`User modify error: ${err}`)
        res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

router.get(`/user/list`, userAuth, requireRole('admin'), async (req, res) => {
    try {
        const users = await list()

        res.status(200).json({ success: true, data: users })
    } catch (err) {
        console.error(`User list error: ${err}`)
        res.status(500).json({ success: false, data: 'Internal Server Error' })
    }
})

// ===========================================================

router.get(`/stats`, userAuth, requireRole('admin'), (req, res) => {

})

router.get(`/refreshDatabase`, userAuth, requireRole('admin'), (req, res) => {
    console.warn("Manual database refresh from panel")

    scraperClient.reparseAllWeeksInDatabase()

    res.redirect('/admin')
})

router.get(`/refreshWeeks`, userAuth, requireRole('admin'), (req, res) => {
    console.warn("Manual week refresh from panel")

    scraperClient.storeAllWeeksToDatabase()

    res.redirect('/admin')
})

router.get(`/sendTestNotification`, userAuth, requireRole('admin'), (req, res) => {
    console.warn("Manual test notification sent from panel")

    webserverClient.sendWSMessage(JSON.stringify({
        week: scraperClient.current_week,
        type: "test",
    }))

    res.redirect('/admin')
})

// ===========================================================

export default router