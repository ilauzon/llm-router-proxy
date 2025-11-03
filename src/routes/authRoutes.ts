import { Router } from 'express'
import { AuthController } from '../controllers/authController'
import { Pool } from 'pg'
import { requireSessionAuth } from '../middleware/authMiddleware'

const router = Router()

export function createAuthRouter(dbService: Pool): Router {
    const controller = new AuthController(dbService)
    const router = Router()
    router.post("/register", controller.register)
    router.post("/login", controller.login)
    router.post("/logout", requireSessionAuth, controller.logout)
    router.post("/new-key", requireSessionAuth, controller.newApiKey)
    router.get("/me", requireSessionAuth, controller.getMyInfo)
    return router
}

export default router