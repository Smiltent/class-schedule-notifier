
import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User from "../db/models/User"

async function root(req: Request, res: Response, next: NextFunction) {
    // EJS locals
    const token = req.cookies?.token
    if (token) {
        try {
            // set locals with user data (displayed in /)
            const payload: any = jwt.verify(token, String(process.env.JWT_SECRET))
            const user = await User.findById(payload.id).lean()
            if (!user) throw new Error('user not found')

            res.locals.user = {
                id: user._id,
                name: user.username,
                role: user.role,
                apiKeyLimit: user.apiKeyLimit,
                favoriteNumber: user.favoriteNumber
            }

        } catch (err) {
            console.error(`JWT Authentication error: ${err}`)
            res.locals.user = null
        }
    } else {
        res.locals.user = null
    }

    // sets the http status local, used for error.ejs
    const ogStatus = res.status.bind(res)
    res.status = (code: number) => {
        res.locals.httpStatus = code
        return ogStatus(code)
    }

    res.locals.httpStatus = res.statusCode
    
    next()

    // debug
    console.debug(`${req.ip} | ${req.method} ${res.statusCode} ${req.originalUrl}`)
}

export { root }