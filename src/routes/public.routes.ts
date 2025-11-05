
import { userAuth, requireRole } from "../middlewares/auth.middleware"
import { register, login } from "../services/auth.service"

import { Router } from 'express'
const router = Router()

const COOKIE = {
    httpOnly: true,
    secure: process.env.ENV === 'prod',
    sameSite: 'strict' as 'strict',
    maxAge: 24 * 60 * 60 * 1000
}

// ===========================================================
router.post('/register', async (req, res) => {
    if (req.cookies?.token) return res.redirect('/')

    try {
        const { username, password, favoriteNumber } = req.body

        await register(username, password, favoriteNumber)
        const token = await login(username, password)
        
        res.cookie('token', token, COOKIE)

        res.render("register", { success: true, message: "login successful" })
    } catch (err: any) {
        console.error(`Error registering user: ${err}`)
        // TODO: remake
        res.redirect(`/register?success=false&message=${encodeURIComponent(err.message)}`)
    }
})

router.get('/register', (req, res) => {
    if (req.cookies?.token) return res.redirect('/')
    res.render("register")
})

// ===========================================================
router.post('/login', async (req, res) => {
    if (req.cookies?.token) return res.redirect('/')

    try {
        const { username, password } = req.body
        const token = await login(username, password)

        res.cookie('token', token, COOKIE)

        res.redirect('/')
    } catch (err: any) {
        console.error(`Error logging in user: ${err}`)
        res.redirect(`/err`)
    }
})

router.get('/login', async (req, res) => {
    if (req.cookies?.token) return res.redirect('/')
    res.render("login")
})

// ===========================================================
router.get('/logout', userAuth, async (req, res) => {
    res.clearCookie('token')
    res.redirect('/')
})

// ===========================================================

router.get('/', (req, res) => {
    res.render("index")
})

router.get('/teapot', (req, res) => {
    res.status(418).render("error")
})

router.get('/adm', userAuth, requireRole('admin'), (req, res) => {
    res.render("admin/adm")
})

router.get('/mng', userAuth, requireRole('manager'), (req, res) => {
    res.render("admin/mng")
})


export default router