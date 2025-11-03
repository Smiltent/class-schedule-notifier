
import { userAuth, requireRole } from "../middlewares/auth.middleware"
import { register, login } from "../services/auth.service"
import GitHub from "../util/github"

import path from 'path'

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
    try {
        const { username, password, favoriteNumber } = req.body

        await register(username, password, favoriteNumber)
        const token = await login(username, password)
        
        res.cookie('token', token, COOKIE)

        res.render("/register", { success: true, message: "login successful"})
    } catch (err: any) {
        console.error(`Error registering user: ${err}`)
        res.redirect(`/register?success=false&message=${encodeURIComponent(err.message)}`)
    }
})

router.get('/register', (req, res) => {
    res.render("register")
})

// ===========================================================
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const { token, role } = await login(username, password)

        res.cookie('token', token, COOKIE)

        switch (role) {
            case 'user':
                res.redirect('/')
            break;
            case 'manager':
                res.redirect('/mng')
            break;
            case 'admin':
                res.redirect('/adm')
            break;  
        }

    } catch (err: any) {
        console.error(`Error logging in user: ${err}`)
        res.status(401).json({ success: false, message: err.message })
    }
})

router.get('/login', async (req, res) => {
    res.render("login")
})

// ===========================================================
router.get('/logout', userAuth, async (req, res) => {
    // TODO:
})

// router.post('/logout', userAuth, async (req, res) => {
//     
// })

// ===========================================================

router.get('/', (req, res) => {
    res.render("index")
})

router.get('/adm', userAuth, requireRole('admin'), (req, res) => {
    res.render("admin/adm")
})

router.get('/mng', userAuth, requireRole('manager'), (req, res) => {
    res.render("admin/mng")
})


export default router