
import { userAuth, requireRole } from "../middlewares/auth.middleware"
import { register, login } from "../services/auth.service"
import GitHub from "../util/github"

import path from 'path'

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

router.get('/register', (req, res) => {

})

// ===========================================================
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

router.get('/login', async (req, res) => {

})

// ===========================================================
router.get('/logout', userAuth, async (req, res) => {
    // TODO:
})

// router.post('/logout', userAuth, async (req, res) => {
//     
// })

// ===========================================================
router.get('/git/hash', (req, res) => {
    var hash = GitHub.getHash()
    if (hash == '') return res.status(500).send("unavailable")

    res.status(200).send(hash)
})

router.get('/git/url', (req, res) => {
    var url = GitHub.getUrl()
    if (url == '') return res.status(500)

    res.status(200).send(url)
})

// ===========================================================

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'))
})

router.get('/adm', userAuth, requireRole('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'admin', 'adminDashboard.html'))
})

router.get('/mng', userAuth, requireRole('manager'), (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'admin', 'apiDashboard.html'))
})


export default router