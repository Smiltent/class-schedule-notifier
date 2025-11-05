
import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

async function root(req: Request, res: Response, next: NextFunction) {
    // EJS locals
    const token = req.cookies?.token
    if (token) {
        try {
            const payload: any = jwt.verify(token, String(process.env.JWT_SECRET))
            res.locals.userName = payload.username
            res.locals.userRole = payload.role
        } catch (err) {
            console.error(`JWT Authentication error: ${err}`)
            res.locals.userName = null
        }
    } else {
        res.locals.userName = null
    }

    const ogStatus = res.status.bind(res)
    res.status = (code: number) => {
        res.locals.httpStatus = code;
        return ogStatus(code);
    }

    res.locals.httpStatus = res.statusCode
    
    next()

    // debug
    console.debug(`${req.ip} | ${req.method} ${res.statusCode} ${req.originalUrl}`)
}

export { root }