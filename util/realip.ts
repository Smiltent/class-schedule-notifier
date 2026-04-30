
import type { Request } from "express"

export default function getClientIp(req: Request) {
    if (req.headers["cf-connecting-ip"]) return req.headers["cf-connecting-ip"]

    return req.ip
}
