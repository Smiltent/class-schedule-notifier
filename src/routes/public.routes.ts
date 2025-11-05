
import { userAuth, requireRole } from "../middlewares/auth.middleware"
import { register, login } from "../services/auth.service"
import rateLimit from "express-rate-limit"

import { Router } from 'express'
const router = Router()

const COOKIE = {
    httpOnly: true,
    secure: process.env.ENV === 'prod',
    sameSite: 'strict' as 'strict',
    maxAge: 24 * 60 * 60 * 1000
}

const RATELIMIT = rateLimit({
    windowMs: 20 * 60 * 1000, // 20 min
    limit: 20,
    handler: (req, res) => {
        res.status(429).render("error")
    }
})

// ===========================================================
router.post('/register', async (req, res) => {
    if (req.cookies?.token) return res.redirect('/')

    try {
        const { username, password, favoriteNumber } = req.body

        await register(username, password, favoriteNumber)
        const token = await login(username, password)
        
        res.cookie('token', token, COOKIE)

        res.render("dError", { dError: "login successful", dErrorColor: "c-green" } )
    } catch (err: any) {
        console.error(`Error registering user: ${err}`)
        res.status(400).render("dError", { dError: err.message, dErrorColor: "c-red" } )
    }
})

router.get('/register', RATELIMIT, (req, res) => {
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
        res.status(400).render("dError", { dError: err.message, dErrorColor: "c-red" } )
    }
})

router.get('/login', RATELIMIT, async (req, res) => {
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

router.get('/admin/user', userAuth, requireRole('admin'), (req, res) => {
    res.render("admin/usr")
})

router.get('/admin/schedule', userAuth, requireRole('admin'), (req, res) => {
    res.render("admin/sch")
})

router.get('/admin/api', userAuth, requireRole('manager'), (req, res) => {
    res.render("admin/api")
})


export default router