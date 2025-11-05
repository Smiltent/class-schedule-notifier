
import { apiAuth } from '../middlewares/auth.middleware'

import { Router } from 'express'
const router = Router()

// ===========================================================
router.get('/list', apiAuth, (req, res) => {
    
})

// ===========================================================
router.get('/class/list', apiAuth, (req, res) => {
    
})

router.get('/class/:id/currentweek', apiAuth, (req, res) => {
    const { id } = req.params
})

router.get('/class/:id/upcomingweek', apiAuth, (req, res) => {
    const { id } = req.params
})

router.get('/class/:id/week/:week', apiAuth, (req, res) => {
    const { id, week } = req.params
})

// ===========================================================
router.get('/teacher/list', apiAuth, (req, res) => {
    
})

router.get('/teacher/:id/currentweek', apiAuth, (req, res) => {
    const { id } = req.params
})

router.get('/teacher/:id/upcomingweek', apiAuth, (req, res) => {
    const { id } = req.params
})

router.get('/teacher/:id/week/:week', apiAuth, (req, res) => {
    const { id, week } = req.params
})

// ===========================================================

export default router