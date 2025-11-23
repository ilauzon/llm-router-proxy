import { Router } from 'express'
import { AdminController } from '../controllers/adminController.ts'
import { Pool } from 'pg'
import { AuthMiddleware } from '../middleware/authMiddleware.ts';
import type { UserDao } from '../dao/userdao.ts';
import type { MetricsDao } from '../dao/metricsdao.ts';

export const createAdminRouter = (userDao: UserDao, metricsDao: MetricsDao, middleware: AuthMiddleware): Router => {
    const controller = new AdminController(userDao, metricsDao)
    const router = Router()
    router.get("/users", middleware.requireAdminSessionAuth, controller.getUsers)
    router.get("/metrics", middleware.requireAdminSessionAuth, controller.getUsageMetrics)
    return router
}