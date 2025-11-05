
import type { Request, Response, NextFunction } from "express"
import ApiKeys from "../db/models/ApiKeys"
import User from "../db/models/User"
import jwt from "jsonwebtoken"

interface AuthRequest extends Request {
    user?: any
    type?: 'jwt' | 'api'
}

async function userAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.token
        if (!token)
            return res.status(401).redirect("/")

        const payload: any = jwt.verify(token, String(process.env.JWT_SECRET))

        const user = await User.findById(payload.id)
        if (!user)
            return res.status(401).redirect("/")

        req.user = user
        req.type = 'jwt'
        next()
    } catch (err) {
        console.error(`JWT Authentication error: ${err}`)
        return res.redirect("/")
    }
}

async function apiAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const apiKey = req.headers['x-api-key'] as string | undefined
        if (!apiKey)
            return res.status(401).json({ success: false, message: 'Missing API key (header: x-api-key)' })

        const payload = await ApiKeys.findOne({ key: apiKey })
        if (!payload)
            return res.status(401).json({ success: false, message: 'Invalid API key' })

        const user = await User.findById(payload.owner)
        if (!user)
            return res.status(401).json({ success: false, message: 'There is no Owner associated with this API key' })

        req.user = user
        req.type = 'api'
        next()
    } catch (err) {
        console.error(`API Authentication error: ${err}`)
        return res.status(401).json({ success: false, message: 'Unauthorized' })
    }
}

function requireRole(role: string) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user)
            return res.status(401).redirect("/")

        if (req.user.role !== role && req.user.role !== "admin")
            return res.status(403).redirect("/")
        
        next()
    }
}

export { userAuth, apiAuth, requireRole }