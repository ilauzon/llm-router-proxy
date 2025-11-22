import type { Request, Response, NextFunction } from "express";
import type { UserDao } from "../dao/userdao.ts";
import type { UUID } from "crypto";

export class AuthMiddleware {
    private userDao: UserDao

    constructor(userDao: UserDao) {
        this.userDao = userDao
    }

    readonly requireSessionAuth = (req: Request, res: Response, next: NextFunction) => {
        if (!req.session.userId) {
            return res.sendStatus(401)
        }
        next()
    }

    readonly requireAdminSessionAuth = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.session.userId) {
            return res.sendStatus(401)
        }

        const user = await this.userDao.getUserById(req.session.userId)
        if (user === null || !user.isadministrator) {
            return res.sendStatus(403)
        }
        next()
    }

    readonly requireApiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer'

        if (token === null || token === undefined) {
            return res.status(401).send("No token provided"); // No token provided, unauthorized
        }

        const user = await this.userDao.getUserByKey(token as UUID)
        if (user === null) {
            return res.status(401).send("Token invalid")
        }
        req.apiKey = token as UUID; 
        next()
    }
}