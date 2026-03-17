
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
    windowMs: 20 * 60 * 1000, // 20 minlog
    limit: 10,
    handler: (req, res) => {
        switch (req.path) {
            case '/login':
                return res.status(429).render("login", { dMsg: "you are being ratelimited", dType: "bad" } )
            
            case '/register':
                return res.status(429).render("register", { dMsg: "you are being ratelimited", dType: "bad" } )

            default:
                return res.status(429).send("You are being ratelimited. Try again later!")
        }
    }
})

// ===========================================================
router.post('/register', LOGIN_REGISTER_RATELIMIT, async (req, res) => {
    if (process.env.REGISTER == "false") return res.status(400).render("register", { dMsg: "registering is disabled", dType: "bad" } )
    if (req.cookies?.token) return res.redirect('/')

    try {
        const { username, password, favoriteNumber } = req.body

        // validate
        if (username.length < 3 || username.length > 20) return res.status(400).render("register", { dMsg: "username must be between 3 and 20 characters", dType: "bad" } )
        if (username.match(/[^a-zA-Z0-9_]/)) return res.status(400).render("register", { dMsg: "username may only contain letters, numbers and underscores", dType: "bad" } )

        if (favoriteNumber && (isNaN(favoriteNumber))) return res.status(400).render("register", { dMsg: "favorite number must be a number between 0 and 100", dType: "bad" } )
        if (password.length < 6 || password.length > 64) return res.status(400).render("register", { dMsg: "password must be between 6 and 64 characters", dType: "bad" } )

        if (typeof password !== 'string' || typeof username !== 'string') return res.status(400).render("register", { dMsg: "how did you manage this? are you trying to inject?", dType: "bad" } )

        await register(username, password, favoriteNumber)
    
        res.render("login", { dMsg: "you have registered. please log in!", dType: "good"} )
    } catch (err: any) {
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

        if (typeof password !== 'string' || typeof username !== 'string') return res.status(400).render("login", { dMsg: "how did you manage this? are you trying to inject?", dType: "bad" } )

        res.cookie('token', token, COOKIE)
        res.redirect('/')
    } catch (err: any) {
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
router.get('/class', (_, res) => {
    res.render("lookup/class")
})

router.get('/classroom', (_, res) => {
    res.render("lookup/classroom")
})

router.get('/teacher', (_, res) => {
    res.render("lookup/teacher")
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