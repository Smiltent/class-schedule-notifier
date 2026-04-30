
import type { Request, Response, NextFunction } from "express"
import getClientIp from "@/util/realip"
import jwt from "jsonwebtoken"

import User from "@/models/User"
import Role from "@/models/Role"

async function root(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token
    if (token) {
        try {
            // set locals with user data (displayed in /)
            const payload: any = jwt.verify(token, String(process.env.JWT_SECRET))
            const user = await User.findById(payload.id).populate("roles").lean()

            if (!user) {
                res.clearCookie("token")
                res.locals.user = { loggedIn: false }
                return next()
            }

            const roleNames = user.roles.map((role: any) => role.name)
            const rolesData = await Role.find({ name: { $in: roleNames } })

            res.locals.user = {
                id: user._id,
                name: user.username,
                roles: roleNames,
                permissions: rolesData.flatMap(r => r.permissions),
                loggedIn: true,
                favoriteNumber: user.favoriteNumber
            }
        } catch (err) {
            console.error(`JWT Authentication error: ${err}`)
            res.clearCookie("token")
            res.locals.user = { loggedIn: false }
        }
    } else {
        res.locals.user = { loggedIn: false }
    }

    const ogStatus = res.status.bind(res)
    res.status = (code: number) => {
        res.locals.httpStatus = code
        return ogStatus(code)
    }

    res.locals.httpStatus = res.statusCode
    res.locals.dType = ""

    // debug
    res.on("finish", () => {
        console.debug(`(${res.locals.user?.name ?? "guest"}) ${getClientIp(req)} | ${req.method} ${res.statusCode} ${req.originalUrl}`)
    })

    next()
}

export { root }