import type { Request, Response, NextFunction } from "express";
import type { Pool } from "pg";
import type { UserDao } from "../dao/userdao.ts";

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
        if (user !== null && user.isadministrator === true) {
            next()
        } else {
            res.sendStatus(403)
        }
    }

    readonly requireApiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {

    }

}