
import type { Request, Response, NextFunction } from "express"
import User from "../db/User"
import jwt from "jsonwebtoken"
import Role from "../db/Role"

interface AuthRequest extends Request {
    user?: any
    type?: 'jwt'
}

async function userAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.token
        if (!token) return res.status(403).render("error")
            
        const payload: any = jwt.verify(token, String(process.env.JWT_SECRET))

        const user = await User.findById(payload.id)
        if (!user) return res.status(403).render("error")
            
        req.user = user
        req.type = 'jwt'
        
        return next()
    } catch (err) {
        console.error(`JWT Authentication error: ${err}`)
        return res.status(401).render("error")
    }
}

/**
 * Check if a user has a role, continue if they do
 * @param role role to check for
 * @returns if they can continue
 * @deprecated in favor of permission based authentication system
 */
function requireRole(role: string) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).render("error")

        const userRoles: string[] = req.user.roles
        if (!userRoles.includes(role)) return res.status(403).render("error")

        return next()
    }
}

/**
 * Check if a user has valid permissions, continue if they match
 * @param permissions permissions, might require multiple?
 * @returns if they can continue
 */
function requirePermission(...permissions: string[]) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).render("error")

        const userRoles: string[] = req.user.roles
        const rolesData = await Role.find({ name: { $in: userRoles } })

        const userPermissions = new Set(
            rolesData.flatMap(r => r.permissions)
        )

        const hasPerm = permissions.some(p => userPermissions.has(p))
        if (!hasPerm) return res.status(403).render("error")
        
        return next()
    }
}

export { userAuth, requireRole, requirePermission }