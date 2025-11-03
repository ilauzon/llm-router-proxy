import { Router } from 'express'
import { AdminController } from '../controllers/adminController.ts'
import { Pool } from 'pg'
import { AuthMiddleware } from '../middleware/authMiddleware.ts';

export function createAdminRouter(dbService: Pool, middleware: AuthMiddleware): Router {
    const controller = new AdminController(dbService)
    const router = Router()
    router.get("/users", middleware.requireAdminSessionAuth, controller.getUsers)
    return router
}