import { Router } from 'express'
import { Pool } from 'pg'
import { AuthMiddleware } from '../middleware/authMiddleware.ts';
import { LlmController } from '../controllers/llmController.ts';

export const createLlmRouter = (dbService: Pool, middleware: AuthMiddleware, origin: string, apiKey: string): Router => {
    const controller = new LlmController(dbService, origin, apiKey)
    const router = Router()

    /**
     * @openapi
     * /api/ask:
     *   post:
     *     security:
     *       - bearerAuth: []
     *     summary: Create a new account and acquire the API key
     *     tags:
     *       - LLM
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               prompt:
     *                 type: string
     *                 description: The prompt to send to the LLM
     *                 example: Good morning
     *               max_tokens:
     *                 type: number
     *                 description: The maximum number of tokens the LLM will respond with
     *                 example: 50
     *     responses:
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *             examples:
     *               success:
     *                 value:
     *                   prompt: Good morning
     *                   response: Good morning! It's a lovely day, isn't it?
     */
    router.post("/ask", middleware.requireApiKeyAuth, controller.ask)
    return router
}