
import { userAuth, requireRole } from "../middlewares/auth.middleware"

import { Router } from 'express'
const router = Router()

// ===========================================================
router.get('/list', userAuth, requireRole('manager'), (req, res) => {
    
})

router.post('/create', userAuth, requireRole('manager'), (req, res) => {
    // return crypto.randomBytes(32).toString('hex')
})

router.delete('/delete', userAuth, requireRole('manager'), (req, res) => {
    
})

// ===========================================================

export default router