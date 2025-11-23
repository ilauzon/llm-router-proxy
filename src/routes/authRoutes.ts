import { Router } from 'express'
import { AuthController } from '../controllers/authController.ts'
import { Pool } from 'pg'
import { AuthMiddleware } from '../middleware/authMiddleware.ts'
import type { JwtService } from '../services/jwtservice.ts'

const router = Router()

export const createAuthRouter = (dbService: Pool, jwtService: JwtService, middleware: AuthMiddleware): Router => {
    const controller = new AuthController(dbService, jwtService)
    const router = Router()
    /**
     * @openapi
     * /auth/register:
     *   post:
     *     summary: Create a new account and acquire the API key
     *     tags:
     *       - Auth
     *     responses:
     *       409:
     *         description: Email is taken
     *       400:
     *         description: Email format is incorrect
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *             examples:
     *               success:
     *                 value:
     *                   apiKey: 024273dd-42b4-44aa-a99e-f92858921883
     */
    router.post("/register", controller.register)
    /**
     * @openapi
     * /auth/login:
     *   post:
     *     summary: Create a new account and acquire the API key
     *     tags:
     *       - Auth
     *     responses:
     *       401:
     *         description: Email or password is incorrect
     *       200:
     *         description: Success
     */
    router.post("/login", controller.login)
    router.post("/refresh", controller.refresh)
    router.post("/logout", controller.logout)
    router.post("/new-key", middleware.requireSessionAuth, controller.newApiKey)
    router.get("/me", middleware.requireSessionAuth, controller.getMyInfo)
    router.post("/new-username", middleware.requireSessionAuth, controller.changeUsername)
    return router
}

export default router