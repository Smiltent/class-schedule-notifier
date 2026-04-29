
import type { Request, Response, NextFunction } from "express"
import User from "@/models/User"
import jwt from "jsonwebtoken"

interface AuthRequest extends Request {
    user?: any
}

async function userAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.token
        if (!token) return res.status(403).render("error")
            
        const payload: any = jwt.verify(token, String(process.env.JWT_SECRET))

        const user = await User.findById(payload.id)
        if (!user) return res.status(403).render("error")
            
        req.user = user
        
        return next()
    } catch (err) {
        console.error(`JWT Authentication error: ${err}`)
        return res.status(401).render("error")
    }
}

/**
 * Check if a user has valid permissions, continue if they match
 * @param permissions permissions, might require multiple?
 * @returns if they can continue
 */
function requirePermission(...permissions: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).render("error")

        const userPermissions = new Set(req.user.permissions)

        const hasPerm = permissions.some(p => userPermissions.has(p))
        if (!hasPerm) return res.status(403).render("error")

        return next()
    }
}

export { userAuth, requirePermission }