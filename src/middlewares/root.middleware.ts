
import type { Request, Response, NextFunction } from "express"
import getClientIp from "../util/realip"
import jwt from "jsonwebtoken"

import User from "../db/User"

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
                roles: user.roles,
                loggedIn: true,
                favoriteNumber: user.favoriteNumber
            }

        } catch (err) {
            console.error(`JWT Authentication error: ${err}`)
            res.locals.user = { loggedIn: false }
        }
    } else {
        res.locals.user = { loggedIn: false }
    }

    // [DEPRECATED] sets the http status local, used for error.ejs
    const ogStatus = res.status.bind(res)
    res.status = (code: number) => {
        res.locals.httpStatus = code
        return ogStatus(code)
    }

    // [DEPRECATED] return http status
    res.locals.dType = ""
    res.locals.httpStatus = res.statusCode
    
    next()

    // debug
    console.debug(`(${res.locals.user.name ?? "guest"}) ${getClientIp(req)} | ${req.method} ${res.statusCode} ${req.originalUrl}`)
}

export { root }