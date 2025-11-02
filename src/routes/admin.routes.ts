
import { userAuth, requireRole } from "../middlewares/auth.middleware"

import { Router } from 'express'
const router = Router()

// ===========================================================
router.post(`/user/create`, userAuth, requireRole('admin'), async (req, res) => {

})

router.delete(`/user/delete`, userAuth, requireRole('admin'), async (req, res) => {

})

router.post(`/user/modify`, userAuth, requireRole('admin'), async (req, res) => {

})

router.get(`/user/list`, userAuth, requireRole('admin'), (req, res) => {

})

// ===========================================================

export default router