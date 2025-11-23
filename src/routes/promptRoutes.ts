import { Router } from 'express'
import { AuthMiddleware } from '../middleware/authMiddleware.ts';
import type { PromptDao } from '../dao/promptdao.ts';
import { PromptController } from '../controllers/promptController.ts';

export const createPromptRouter = (promptDao: PromptDao, middleware: AuthMiddleware): Router => {
    const controller = new PromptController(promptDao)
    const router = Router()
    router.get("/", middleware.requireSessionAuth, controller.getPrompts)
    router.get("/:userid", middleware.requireAdminSessionAuth, controller.getPromptsForUser)
    router.get("/:userid/:promptid", middleware.requireSessionAuth, controller.getPrompt)
    router.post("/:userid", middleware.requireSessionAuth, controller.postPrompt)
    router.put("/:userid/:promptid", middleware.requireSessionAuth, controller.updatePrompt)
    router.delete("/:userid/:promptid", middleware.requireSessionAuth, controller.deletePrompt)
    return router
}