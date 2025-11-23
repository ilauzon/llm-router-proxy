import { Router } from 'express'
import { AdminController } from '../controllers/adminController.ts'
import { Pool } from 'pg'
import { AuthMiddleware } from '../middleware/authMiddleware.ts';
import type { UserDao } from '../dao/userdao.ts';
import type { MetricsDao } from '../dao/metricsdao.ts';

export const createAdminRouter = (userDao: UserDao, metricsDao: MetricsDao, middleware: AuthMiddleware): Router => {
    const controller = new AdminController(userDao, metricsDao)
    const router = Router()

    /**
     * @openapi
     * /admin/users:
     *   get:
     *     summary: Get users and their API usage
     *     description:
     *       Access token cookie required.
     *       User must be an administrator.
     *       'requestcount` refers to their usage of the LLM, not total usage.
     *     tags:
     *       - Admin
     *     responses:
     *       401:
     *         description: Login required
     *       403:
     *         description: Logged-in user is not an administrator
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/User'
     *             examples:
     *               success:
     *                 value:
     *                   - id: 11
     *                     email: john.doe@example.com
     *                     username: john.doe 
     *                     requestcount: 15
     *                   - id: 12
     *                     email: jane.smith@example.com
     *                     name: jane.smith
     *                     requestcount: 18
     */
    router.get("/users", middleware.requireAdminSessionAuth, controller.getUsers)

    /**
     * @openapi
     * /admin/metrics:
     *   get:
     *     summary: Get usage metrics per endpoint and HTTP method
     *     description:
     *       Access token cookie required.
     *       User must be an administrator.
     *     security:
     *       - accessTokenCookieAuth: []
     *     tags:
     *       - Admin
     *     responses:
     *       401:
     *         description: Login required
     *       403:
     *         description: Logged-in user is not an administrator
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             examples:
     *               success:
     *                 value:
     *                   - method: GET
     *                     endpoint: /auth/me
     *                     requests: 9
     *                   - method: POST
     *                     endpoint: /prompts/1/1
     *                     requests: 3
     *                   - method: GET
     *                     endpoint: /prompts/1/1
     *                     requests: 13
     */
    router.get("/metrics", middleware.requireAdminSessionAuth, controller.getUsageMetrics)

    /**
     * @openapi
     * /admin/user-metrics:
     *   get:
     *     summary: Get usage metrics for all endpoints per user
     *     description:
     *       Access token cookie required.
     *       User must be an administrator.
     *     tags:
     *       - Admin
     *     responses:
     *       401:
     *         description: Login required
     *       403:
     *         description: Logged-in user is not an administrator
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             examples:
     *               success:
     *                 value:
     *                   - username: john.doe
     *                     email: john.doe@example.com
     *                     requests: 26
     *                   - username: jane.smith
     *                     email: jane.smith@example.com
     *                     requests: 30
     */
    router.get("/user-metrics", middleware.requireAdminSessionAuth, controller.getUsageMetricsPerUser)
    return router
}