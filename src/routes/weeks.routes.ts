
import { apiAuth } from '../middlewares/auth.middleware'

import { Router } from 'express'
const router = Router()

// ===========================================================
router.post('/list', apiAuth, (req, res) => {
    
})

// ===========================================================
router.post('/class/list', apiAuth, (req, res) => {
    
})

router.post('/class/:id/currentweek', apiAuth, (req, res) => {
    
})

router.post('/class/:id/upcomingweek', apiAuth, (req, res) => {
    
})

router.post('/class/:id/week/:week', apiAuth, (req, res) => {
    
})

// ===========================================================
router.post('/teacher/list', apiAuth, (req, res) => {
    
})

router.post('/teacher/:id/currentweek', apiAuth, (req, res) => {
    
})

router.post('/teacher/:id/upcomingweek', apiAuth, (req, res) => {
    
})

router.post('/teacher/:id/week/:week', apiAuth, (req, res) => {
    
})

// ===========================================================

export default router