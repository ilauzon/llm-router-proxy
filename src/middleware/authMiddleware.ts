import type { Request, Response, NextFunction } from "express";
import type { UserDao } from "../dao/userdao.ts";
import type { UUID } from "crypto";
import type { MetricsDao } from "../dao/metricsdao.ts";

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
            return res.status(401).send("Not signed in.")
        }

        // track usage metrics for signed-in users
        this.metricsDao.submitOrUpdateMetric(req)

        next()
    }

    /**
     * @returns 401 if the user is not authenticated, 403 if the user is not an administrator.
     */
    readonly requireAdminSessionAuth = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.userId) {
            return res.status(401).send("Not signed in.")
        }

        // track usage metrics for signed-in users
        this.metricsDao.submitOrUpdateMetric(req)

        const user = await this.userDao.getUserById(req.userId)

        if (user === null) {
            return res.status(401).send(`User with ID ${req.userId} not found.`)
        }

        if (!user.isadministrator) {
            return res.status(403).send("Not an administrator.")
        }

        next()
    }

    /**
     * @returns 401 if the user did not provide a valid bearer token in the `Authorization` header.
     */
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