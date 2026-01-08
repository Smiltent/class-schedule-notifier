
import type { Request, Response, NextFunction } from "express"
import User from "../db/models/User"
import jwt from "jsonwebtoken"

interface AuthRequest extends Request {
    user?: any
    type?: 'jwt' | 'api'
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

// async function apiAuth(req: AuthRequest, res: Response, next: NextFunction) {
//     try {
//         const apiKey = req.headers['x-api-key'] as string | undefined
//         if (!apiKey) // no api key provided
//             return res.status(403).json({ success: false, message: 'Forbidden: Missing API key (header: x-api-key)' })

//         const payload = await ApiKeys.findOne({ key: apiKey })
//         if (!payload) // no active api key
//             return res.status(403).json({ success: false, message: 'Forbidden: Invalid API key' })

//         const user = await User.findById(payload.owner)
//         if (!user) // happens on user deletion (just in case)
//             return res.status(500).json({ success: false, message: 'Internal Server Error: There is no Owner associated with this API key' })

//         req.user = user
//         req.type = 'api'
//         next()
//     } catch (err) {
//         console.error(`API Authentication error: ${err}`)
//         return res.status(500).json({ success: false, message: 'Internal Server Error' })
//     }
// }

function requireRole(role: string) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) // if not logged in
            return res.status(401).render("error")

        if (req.user.role !== role && req.user.role !== "admin") // if doesn't match role or isnt admin
            return res.status(403).render("error")

        next()
    }
}

export { userAuth, requireRole }