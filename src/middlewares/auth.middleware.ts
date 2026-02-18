
import type { Request, Response, NextFunction } from "express"
import User from "../db/User"
import jwt from "jsonwebtoken"

interface AuthRequest extends Request {
    user?: any
    type?: 'jwt'
}

async function userAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.token
        if (!token) return res.status(403).render("error") // if no token found
            
        const payload: any = jwt.verify(token, String(process.env.JWT_SECRET))

        const user = await User.findById(payload.id)
        if (!user) return res.status(403).render("error") // if user doesnt exist
            
        req.user = user
        req.type = 'jwt'
        
        next()
    } catch (err) {
        console.error(`JWT Authentication error: ${err}`)
        return res.status(401).render("error")
    }
}

/**
 * @deprecated in favor of permission based authentication system
 */
function requireRole(role: string) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) // if not logged in
            return res.status(401).render("error")

        if (req.user.role !== role && req.user.role !== "admin") // if doesn't match role or isnt admin
            return res.status(403).render("error")

        next()
    }
}
/*
    Permissions:
        * basic - view basic stuff....
        * notes:create - create personal notes
        * notes:modify - modify personal notes
        * notes:
        * groups:view - view group schedules
        * groups:modify - modify group schedules that you own
        * groups:create - create groups
        * groups:admin - admin access to everything related to groups
        * 
        * smil:smil - 

*/
function requirePermission(...permissions: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).render("error")

        const userPermissions: string[] = req.user.permissions || []
        const hasRequiredPermissions = permissions.every(p => userPermissions.includes(p))

        if (!hasRequiredPermissions) return res.status(403).render("error")

        next()
    }
}

export { userAuth, requireRole, requirePermission }