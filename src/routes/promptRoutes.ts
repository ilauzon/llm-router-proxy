import { Router } from 'express'
import { AuthMiddleware } from '../middleware/authMiddleware.ts';
import type { PromptDao } from '../dao/promptdao.ts';
import { PromptController } from '../controllers/promptController.ts';

export const createPromptRouter = (promptDao: PromptDao, middleware: AuthMiddleware): Router => {
    const controller = new PromptController(promptDao)
    const router = Router()

    /**
     * @openapi
     * /prompts:
     *   get:
     *     summary: Get all prompts saved to your account
     *     description: If you are an administrator, this returns all prompts for all accounts.
     *       Access token cookie required.
     *     tags:
     *       - Prompts
     *     responses:
     *       401:
     *         description: Not signed in
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             examples:
     *               success (Admin):
     *                 value:
     *                   - promptid: 1
     *                     userid: 11
     *                     title: Greeting
     *                     prompt: Good morning!
     *                   - promptid: 2
     *                     userid: 11
     *                     title: Greeting 2
     *                     prompt: How are you?
     *                   - promptid: 3
     *                     userid: 12
     *                     title: Facts
     *                     prompt: Give me 3 fun facts.
     *               success (Non-admin with user ID 12):
     *                 value:
     *                   - promptid: 3
     *                     userid: 12
     *                     title: Facts
     *                     prompt: Give me 3 fun facts.
     */
    router.get("/", middleware.requireSessionAuth, controller.getPrompts)

    /**
     * @openapi
     * /prompts/{userid}:
     *   get:
     *     summary: Get all prompts for a specific user.
     *     description:
     *       Access token cookie required.
     *       User must be an administrator.
     *     tags:
     *       - Prompts
     *     parameters:
     *       - in: path
     *         name: userid
     *         description: The ID of the user
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       401:
     *         description: Not signed in
     *       403:
     *         description: Not an administrator
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             examples:
     *               success:
     *                 value:
     *                   - promptid: 1
     *                     userid: 11
     *                     title: Greeting
     *                     prompt: Good morning!
     *                   - promptid: 2
     *                     userid: 11
     *                     title: Greeting 2
     *                     prompt: How are you?
     */
    router.get("/:userid", middleware.requireAdminSessionAuth, controller.getPromptsForUser)

    /**
     * @openapi
     * /prompts/{userid}/{promptid}:
     *   get:
     *     summary: Get a specific prompt.
     *     description:
     *       Access token cookie required.
     *       User must be an administrator if userid != their user ID.
     *     tags:
     *       - Prompts
     *     parameters:
     *       - in: path
     *         name: userid
     *         description: The ID of the user
     *         required: true
     *         schema:
     *           type: integer
     *       - in: path
     *         name: promptid
     *         description: The ID of the prompt
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       401:
     *         description: Not signed in
     *       403:
     *         description: Not an administrator
     *       404:
     *         description: Prompt does not exist
     *       200:
     *         description: Success
     *         content:
     *           application/json:
     *             examples:
     *               success:
     *                 value:
     *                   - promptid: 1
     *                     userid: 11
     *                     title: Greeting
     *                     prompt: Good morning!
     */
    router.get("/:userid/:promptid", middleware.requireSessionAuth, controller.getPrompt)

    /**
     * @openapi
     * /prompts/{userid}:
     *   post:
     *     summary: Post a prompt to the user's account.
     *     description:
     *       Access token cookie required.
     *       User must be an administrator if userid != their user ID.
     *     tags:
     *       - Prompts
     *     parameters:
     *       - in: path
     *         name: userid
     *         description: The ID of the user
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 description: The title of the prompt
     *                 example: Greeting
     *               prompt:
     *                 type: string
     *                 description: The prompt itself
     *                 example: Good morning!
     *     responses:
     *       401:
     *         description: Not signed in
     *       403:
     *         description: Not an administrator
     *       204:
     *         description: Success
     */
    router.post("/:userid", middleware.requireSessionAuth, controller.postPrompt)

    /**
     * @openapi
     * /prompts/{userid}/{promptid}:
     *   put:
     *     summary: Update a prompt.
     *     description:
     *       Access token cookie required.
     *       User must be an administrator if userid != their user ID.
     *     tags:
     *       - Prompts
     *     parameters:
     *       - in: path
     *         name: userid
     *         description: The ID of the user
     *         required: true
     *         schema:
     *           type: integer
     *       - in: path
     *         name: promptid
     *         description: The ID of the prompt
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 description: The title of the prompt
     *                 example: Greeting
     *               prompt:
     *                 type: string
     *                 description: The prompt itself
     *                 example: Good morning!
     *     responses:
     *       401:
     *         description: Not signed in
     *       403:
     *         description: Not an administrator
     *       404:
     *         description: Prompt does not exist
     *       204:
     *         description: Success
     */
    router.put("/:userid/:promptid", middleware.requireSessionAuth, controller.updatePrompt)

    /**
     * @openapi
     * /prompts/{userid}/{promptid}:
     *   delete:
     *     summary: Delete a prompt.
     *     description:
     *       Access token cookie required.
     *       User must be an administrator if userid != their user ID.
     *     tags:
     *       - Prompts
     *     parameters:
     *       - in: path
     *         name: userid
     *         description: The ID of the user
     *         required: true
     *         schema:
     *           type: integer
     *       - in: path
     *         name: promptid
     *         description: The ID of the prompt
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       401:
     *         description: Not signed in
     *       403:
     *         description: Not an administrator
     *       404:
     *         description: Prompt does not exist
     *       204:
     *         description: Success
     */
    router.delete("/:userid/:promptid", middleware.requireSessionAuth, controller.deletePrompt)
    return router
}