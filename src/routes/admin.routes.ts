
import { scraperClient } from "../.."
import { userAuth, requireRole } from "../middlewares/auth.middleware"

import { Router } from 'express'
const router = Router()

// ===========================================================
router.post(`/user/create`, userAuth, requireRole('admin'), async (req, res) => {

})

router.delete(`/user/delete`, userAuth, requireRole('admin'), async (req, res) => {

})

router.post(`/user/modify`, userAuth, requireRole('admin'), async (req, res) => {

})

router.get(`/user/list`, userAuth, requireRole('admin'), (req, res) => {

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

// ===========================================================

export default router