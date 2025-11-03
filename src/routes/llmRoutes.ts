import { Router } from 'express'
import { Pool } from 'pg'
import { AuthMiddleware } from '../middleware/authMiddleware.ts';
import { LlmController } from '../controllers/llmController.ts';

export function createLlmRouter(dbService: Pool, middleware: AuthMiddleware, origin: string, apiKey: string): Router {
    const controller = new LlmController(dbService, origin, apiKey)
    const router = Router()
    router.post("/ask", middleware.requireApiKeyAuth, controller.ask)
    return router
}