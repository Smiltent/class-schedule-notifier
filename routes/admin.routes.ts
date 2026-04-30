
import { userAuth, requirePermission } from "@/middlewares/auth.middleware"
import { scraper, express } from "@/index"

import { Router } from 'express'
const router = Router()

// ===========================================================

router.get('/', userAuth, requirePermission('admin'), (_, res) => {
    res.render("admin/index")
})

router.post(`/refreshDatabase`, userAuth, requirePermission('admin'), (req, res) => {
    console.warn("Manual database refresh from panel")

    scraper.reparseAllWeeksInDatabase()

    res.redirect('/admin')
})

router.post(`/refreshWeeks`, userAuth, requirePermission('admin'), (req, res) => {
    console.warn("Manual week refresh from panel")

    scraper.storeAllWeeksToDatabase()

    res.redirect('/admin')
})

router.post(`/sendTestNotification`, userAuth, requirePermission('admin'), (req, res) => {
    console.warn("Manual test notification sent from panel")

    express.sendWSMessage(JSON.stringify({
        week: scraper.currentWeek,
        type: "test",
        changedClasses: ["all"]
    }))

    res.redirect('/admin')
})

router.post(`/sendSpecificTestNotification`, userAuth, requirePermission('admin'), (req, res) => {
    const { week, clazz, type } = req.body
    console.warn("Manual test notification sent from panel")

    express.sendWSMessage(JSON.stringify({
        week: week,
        type,
        changedClasses: [ String(clazz) ]
    }))

    res.redirect('/admin')
})


// ===========================================================

export default router