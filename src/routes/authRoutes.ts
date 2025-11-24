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
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 description: The user's email
     *                 example: john.doe@example.com
     *               password:
     *                 type: string
     *                 description: The user's password
     *                 example: johnspassword
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
     *     summary: Log in with an existing account
     *     tags:
     *       - Auth
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 description: The user's email
     *                 example: john.doe@example.com
     *               password:
     *                 type: string
     *                 description: The user's password
     *                 example: johnspassword
     *     responses:
     *       401:
     *         description: Email or password is incorrect
     *       200:
     *         description: Success. Sets the accessToken cookie and refreshToken cookie.
     */
    router.post("/login", controller.login)

    /**
     * @openapi
     * /auth/refresh:
     *   post:
     *     summary: Refresh your access token
     *     description:
     *       Refresh token cookie required.
     *     tags:
     *       - Auth
     *     responses:
     *       401:
     *         description: refreshToken cookie is invalid or unset
     *       200:
     *         description: Success. Sets the accessToken cookie.
     */
    router.post("/refresh", controller.refresh)

    /**
     * @openapi
     * /auth/logout:
     *   post:
     *     summary: Log out of your account
     *     tags:
     *       - Auth
     *     responses:
     *       200:
     *         description: Success. Clears the accessToken and refreshToken cookies, and invalidates the refresh token.
     */
    router.post("/logout", controller.logout)

    /**
     * @openapi
     * /auth/new-key:
     *   post:
     *     summary: Get a new API key.
     *     description:
     *       Access token cookie required.
     *     tags:
     *       - Auth
     *     responses:
     *       401: 
     *         description: Not signed in
     *       200:
     *         description: Success. Invalidates the old API key and issues a new API key.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *             examples:
     *               success:
     *                 value:
     *                   apiKey: 024273dd-42b4-44aa-a99e-f92858921883
     */
    router.post("/new-key", middleware.requireSessionAuth, controller.newApiKey)

    /**
     * @openapi
     * /auth/me:
     *   get:
     *     summary: Get the current user's information
     *     description:
     *       Access token cookie required.
     *     tags:
     *       - Auth
     *     responses:
     *       401: 
     *         description: Not signed in
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *             examples:
     *               success:
     *                 value:
     *                   id: 11,
     *                   email: john.doe@example.com,
     *                   username: john.doe,
     *                   isadministrator: false,
     *                   requestcount: 37
     */
    router.get("/me", middleware.requireSessionAuth, controller.getMyInfo)

    /**
     * @openapi
     * /auth/new-username:
     *   post:
     *     summary: Change the username of the currently-logged-in user.
     *     description:
     *       Access token cookie required.
     *     tags:
     *       - Auth
     *     responses:
     *       401: 
     *         description: Not signed in
     *       204:
     *         description: Success
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *                 description: The new username
     *                 example: johnsnewusername
     */
    router.post("/new-username", middleware.requireSessionAuth, controller.changeUsername)
    return router
}

export default router