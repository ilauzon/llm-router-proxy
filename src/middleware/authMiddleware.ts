import type { Request, Response, NextFunction } from "express";
import type { UserDao } from "../dao/userdao.ts";
import type { UUID } from "crypto";
import type { MetricsDao } from "../dao/metricsdao.ts";
import { NO_TOKEN_PROVIDED, NOT_AN_ADMIN, NOT_SIGNED_IN, TOKEN_INVALID, USER_ID_NOT_FOUND } from "../lang/en.ts";
import { fmt } from "../lang/fmt.ts";

export class AuthMiddleware {
    private userDao: UserDao
    private metricsDao: MetricsDao

    constructor(userDao: UserDao, metricsDao: MetricsDao) {
        this.userDao = userDao
        this.metricsDao = metricsDao
    }

    /**
     * @returns 401 if the user is not authenticated.
     */
    readonly requireSessionAuth = (req: Request, res: Response, next: NextFunction) => {

        if (!req.userId) {
            return res.status(401).send(NOT_SIGNED_IN)
        }

        // track usage metrics for signed-in users
        this.metricsDao.submitOrUpdateMetric(req).catch(e => console.error(e))

        next()
    }

    /**
     * @returns 401 if the user is not authenticated, 403 if the user is not an administrator.
     */
    readonly requireAdminSessionAuth = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.userId) {
            return res.status(401).send(NOT_SIGNED_IN)
        }

        const user = await this.userDao.getUserById(req.userId)

        if (user === null) {
            return res.status(401).send(fmt(USER_ID_NOT_FOUND, req.userId))
        }

        if (!user.isadministrator) {
            return res.status(403).send(NOT_AN_ADMIN)
        }

        // track usage metrics for signed-in users
        this.metricsDao.submitOrUpdateMetric(req).catch(e => console.error(e))

        next()
    }

    /**
     * @returns 401 if the user did not provide a valid bearer token in the `Authorization` header.
     */
    readonly requireApiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer'

        if (token === null || token === undefined) {
            return res.status(401).send(NO_TOKEN_PROVIDED); // No token provided, unauthorized
        }

        const user = await this.userDao.getUserByKey(token as UUID)
        if (user === null) {
            return res.status(401).send(TOKEN_INVALID)
        }
        req.apiKey = token as UUID; 
        next()
    }
}