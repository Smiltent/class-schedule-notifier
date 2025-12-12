
import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

import User from "../db/models/User"
import ClassWeekData from "../db/models/ClassWeekData"
import TeacherWeekData from "../db/models/TeacherWeekData"
import ClassroomWeekData from "../db/models/ClassroomWeekData"

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

    // sets the http status local, used for error.ejs
    const ogStatus = res.status.bind(res)
    res.status = (code: number) => {
        res.locals.httpStatus = code
        return ogStatus(code)
    }

    // set teacher, class and classroom data
    const { type, week, q } = req.query

    try {
        if (type === 'class' && week && q) {
            const b = await ClassWeekData.findOne(
                { [`data.${q}`]: { $exists: true}, week }
            )

        } else if (type === 'teacher' && week && q) {
            res.locals.teacher = await TeacherWeekData.find({ week, data: q })
        } else if (type === 'classroom' && week && q) {
            res.locals.classroom = await ClassroomWeekData.find({ week, data: q })
        } else {
            res.locals.class = null
            res.locals.teacher = null
            res.locals.classroom = null
        }
    } catch (err) {
        console.error(`Query error: ${err}`)
    }

    // return http status
    res.locals.dType = ""
    res.locals.httpStatus = res.statusCode
    
    next()

    // debug
    console.debug(`${req.ip} | ${req.method} ${res.statusCode} ${req.originalUrl}`)
}

export { root }