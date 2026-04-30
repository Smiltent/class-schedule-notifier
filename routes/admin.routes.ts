
import { userAuth, requirePermission } from "@/middlewares/auth.middleware"

import { Router } from 'express'
const router = Router()

// ===========================================================
router.get('/', userAuth, requirePermission('admin'), (_, res) => {
    res.render("admin/index")
})

export default router