
import { userAuth, requireRole } from "../middlewares/auth.middleware"
import { register, login } from "../services/auth.service"
import rateLimit from "express-rate-limit"

import { Router } from 'express'
import path from "path"
const router = Router()

const COOKIE = {
    httpOnly: true,
    secure: process.env.ENV === 'prod',
    sameSite: 'strict' as 'strict',
    maxAge: 24 * 60 * 60 * 1000
}

const LOGIN_REGISTER_RATELIMIT = rateLimit({
    windowMs: 20 * 60 * 1000, // 20 min
    limit: 10,
    handler: (req, res) => {
        res.status(429).render("error")
    }
})

// ===========================================================
router.post('/register', LOGIN_REGISTER_RATELIMIT, async (req, res) => {
    if (req.cookies?.token) return res.redirect('/')

    try {
        const { username, password, favoriteNumber } = req.body

        await register(username, password, favoriteNumber)
    
        res.status(400).render("login", { dMsg: "you have registered. please log in!", dType: "good"} )
    } catch (err: any) {
        console.error(`Error registering user: ${err}`)
        res.status(400).render("register", { dMsg: err.message, dType: "bad" } )
    }
})

router.get('/register', (req, res) => {
    if (req.cookies?.token) return res.redirect('/')
    res.render("register")
})

// ===========================================================
router.post('/login', LOGIN_REGISTER_RATELIMIT, async (req, res) => {
    if (req.cookies?.token) return res.redirect('/')

    try {
        const { username, password } = req.body
        const token = await login(username, password)

        res.cookie('token', token, COOKIE)

        res.redirect('/')
    } catch (err: any) {
        console.error(`Error logging in user: ${err}`)
        res.status(400).render("login", { dMsg: err.message, dType: "bad" } )
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
router.get('/lookup', (req, res) => {
    res.redirect('/')
})

router.get('/lookup/class', (req, res) => {
    res.render("pages/lookupClass")
})

router.get('/lookup/classroom', (req, res) => {
    res.render("pages/lookupClassroom")
})

router.get('/lookup/teacher', (req, res) => {
    res.render("pages/lookupTeacher")
})

router.get('/map', (req, res) => {
    res.render("pages/map")
})

// ===========================================================

router.get('/', (req, res) => {
    res.render("index")
})

router.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'favicon.ico'))
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