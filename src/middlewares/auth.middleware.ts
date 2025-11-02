
import type { Request, Response, NextFunction } from "express"
import User from "../db/models/User"
import jwt from "jsonwebtoken"
import ApiKeys from "../db/models/ApiKeys"

interface AuthRequest extends Request {
    user?: any
    type?: 'jwt' | 'api'
}

async function userAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const header = req.headers.authorization
        if (!header || !header.startsWith('Bearer '))
            return res.status(401).json({ success: false, message: 'Unauthorized' })

        const token = String(header.split(' ')[1])
        const check: any = jwt.verify(token, String(process.env.JWT_SECRET))

        const user = await User.findById(check.id)
        if (!user)
            return res.status(401).json({ success: false, message: 'Unauthorized' })

        req.user = user
        req.type = 'jwt'
        next()
    } catch (err) {
        console.error(`JWT Authentication error: ${err}`)
        return res.status(401).json({ success: false, message: 'Unauthorized' })
    }
}

async function apiAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const apiKey = req.headers['x-api-key'] as string | undefined
        if (!apiKey)
            return res.status(401).json({ success: false, message: 'Missing API key' })

        const verify = await ApiKeys.findOne({ key: apiKey })
        if (!verify)
            return res.status(401).json({ success: false, message: 'Invalid API key' })

        const user = await User.findById(verify.owner)
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
            return res.status(401).json({ success: false, message: 'Unauthorized' })

        if (req.user.role !== role)
            return res.status(403).json({ success: false, message: 'Forbidden' })

        next()
    }
}

export { userAuth, apiAuth, requireRole }