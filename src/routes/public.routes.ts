
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
    if (process.env.REGISTER == "false") return res.status(400).render("register", { dMsg: "registering is disabled", dType: "bad" } )
    if (req.cookies?.token) return res.redirect('/')

    try {
        const { username, password, favoriteNumber } = req.body

        // validate
        if (username.length < 3 || username.length > 20) throw new Error("username must be between 3 and 20 characters")
        if (username.match(/[^a-zA-Z0-9_]/)) throw new Error("username can only contain letters, numbers and underscores")

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
router.get('/logout', userAuth, async (_, res) => {
    res.clearCookie('token')
    res.redirect('/')
})

// ===========================================================
router.get('/lookup', (_, res) => {
    res.redirect('/')
})

router.get('/lookup/class', (_, res) => {
    res.render("pages/lookupClass")
})

// router.get('/lookup/classroom', (_, res) => {
//     res.render("pages/lookupClassroom")
// })

router.get('/lookup/teacher', (_, res) => {
    res.render("pages/lookupTeacher")
})

// ===========================================================

router.get('/', (_, res) => {
    res.render("index")
})

router.get('/favicon.ico', (_, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'favicon.ico'))
})

router.get('/teapot', (_, res) => {
    res.status(418).render("error")
})

router.get('/admin', userAuth, requireRole('admin'), (_, res) => {
    res.render("admin/index")
})


export default router