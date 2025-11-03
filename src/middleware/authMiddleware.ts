import type { Request, Response, NextFunction } from "express";

export function requireSessionAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
        return res.sendStatus(401)
    }
    next()
}