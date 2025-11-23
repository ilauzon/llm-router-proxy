import { Router } from 'express'
import { AuthController } from '../controllers/authController.ts'
import { Pool } from 'pg'
import { AuthMiddleware } from '../middleware/authMiddleware.ts'
import type { JwtService } from '../services/jwtservice.ts'

const router = Router()

export function createAuthRouter(dbService: Pool, jwtService: JwtService, middleware: AuthMiddleware): Router {
    const controller = new AuthController(dbService, jwtService)
    const router = Router()
    router.post("/register", controller.register)
    router.post("/login", controller.login)
    router.post("/refresh", controller.refresh)
    router.post("/logout", controller.logout)
    router.post("/new-key", middleware.requireSessionAuth, controller.newApiKey)
    router.get("/me", middleware.requireSessionAuth, controller.getMyInfo)
    return router
}

export default router