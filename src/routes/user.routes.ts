
import { userAuth, requireRole } from "../middlewares/auth.middleware"
import { register, login } from "../services/auth.service"

import { Router } from 'express'
const router = Router()

// ===========================================================
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await register(username, password)

        res.status(201).json({ success: true, user})
    } catch (err: any) {
        console.error(`Error registering user: ${err}`)
        res.status(400).json({ success: false, message: err.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const token = await login(username, password)

        res.json({ success: true, token })
    } catch (err: any) {
        console.error(`Error logging in user: ${err}`)
        res.status(401).json({ success: false, message: err.message })
    }
})

router.post('/logout', userAuth, async (req, res) => {
    // TODO:
})

// ===========================================================
router.post(`/admin/create`, userAuth, requireRole('admin'), async (req, res) => {

})

router.delete(`/admin/delete`, userAuth, requireRole('admin'), async (req, res) => {

})

router.post(`/admin/modify`, userAuth, requireRole('admin'), async (req, res) => {

})

router.get(`/admin/list`, userAuth, requireRole('admin'), (req, res) => {

})

// ===========================================================

export default router