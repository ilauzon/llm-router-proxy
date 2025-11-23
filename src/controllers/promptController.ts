import type { Request, Response } from 'express';
import type { PromptDao } from "../dao/promptdao.ts";
import type { Prompt } from '../models/prompt.ts';
import { BadPrompt, DuplicatePrompt, PromptNotFound } from '../dao/promptdao.ts';


export class PromptController {
    private readonly promptDao: PromptDao

    constructor(promptDao: PromptDao) {
        this.promptDao = promptDao
    }

    readonly getPrompts = async (req: Request, res: Response) => {
        if (req.isAdministrator) {
            const prompts = await this.promptDao.getPrompts()
            return res.json(prompts)
        } else {
            const prompts = await this.promptDao.getPromptsForUser(req.userId!)
            res.json(prompts)
        }
    }

    readonly getPromptsForUser = async (req: Request, res: Response) => {
        const requestedUser = this.validateUserIdParameter(req, res);
        if (!requestedUser) return

        const prompts = await this.promptDao.getPromptsForUser(requestedUser)
        res.json(prompts)
    }

    readonly getPrompt = async (req: Request, res: Response) => {
        const requestedUser = this.validateUserIdParameter(req, res, false, !req.isAdministrator);
        if (!requestedUser) return
        const requestedPrompt = this.validatePromptIdParameter(req, res);
        if (!requestedPrompt) return

        let prompts
        try {
            prompts = await this.promptDao.getPrompt(requestedPrompt, requestedUser)
        } catch (e) {
            if (e instanceof PromptNotFound) {
                return res.sendStatus(404)
            }
        }

        res.json(prompts)
    }

    readonly postPrompt = async (req: Request, res: Response) => {
        const requestedUser = this.validateUserIdParameter(req, res, true, !req.isAdministrator);
        if (!requestedUser) return

        try {
            const prompt = req.body as Prompt
            await this.promptDao.createPrompt(prompt)
        } catch (e) {
            if (e instanceof BadPrompt) {
                return res.sendStatus(400)
            } else if (e instanceof DuplicatePrompt) {
                return res.sendStatus(409)
            }
            else {
                throw e
            }
        }

        return res.sendStatus(204)
    }

    readonly updatePrompt = async (req: Request, res: Response) => {
        const requestedUser = this.validateUserIdParameter(req, res, true, !req.isAdministrator);
        if (!requestedUser) return
        const requestedPrompt = this.validatePromptIdParameter(req, res, true);
        if (!requestedPrompt) return

        try {
            const prompt = req.body as Prompt
            await this.promptDao.updatePrompt(prompt)
        } catch (e) {
            if (e instanceof BadPrompt) {
                return res.sendStatus(400)
            } else if (e instanceof PromptNotFound) {
                return res.sendStatus(404)
            } else {
                throw e
            }
        }

        return res.sendStatus(204)
    }

    readonly deletePrompt = async (req: Request, res: Response) => {
        const requestedUser = this.validateUserIdParameter(req, res, false, !req.isAdministrator);
        if (!requestedUser) return
        const requestedPrompt = this.validatePromptIdParameter(req, res);
        if (!requestedPrompt) return

        let promptToDelete: Prompt;
        try {
            promptToDelete = await this.promptDao.getPrompt(requestedPrompt, requestedUser)
        } catch (e) {
            if (e instanceof PromptNotFound) {
                return res.sendStatus(404)
            } else {
                throw e
            }
        }

        try {
            await this.promptDao.deletePrompt(requestedPrompt, requestedUser)
        } catch (e) {
            if (e instanceof BadPrompt) {
                return res.sendStatus(400)
            } else if (e instanceof PromptNotFound) {
                return res.sendStatus(404)
            } else {
                throw e
            }
        }

        return res.sendStatus(204)
    }

    private readonly validateUserIdParameter = (req: Request, res: Response, validateBody: boolean = false, mustMatchToken: boolean = false): number | null => {
        const requestedUser = req.params["userid"]
        if (!requestedUser) {
            res.status(400).send("Missing 'userid' parameter.")
            return null
        }

        const requestedUserId = parseInt(requestedUser)

        if (isNaN(requestedUserId)) {
            res.status(400).send("User ID must be an integer.")
            return null
        }

        if (validateBody) {
            const prompt = req.body as Prompt
            if (requestedUserId !== prompt.userid && prompt.userid !== undefined) {
                res.status(400).send("User ID must match userid in body if it is included in body.")
                return null
            }
            (req.body as Prompt).userid = requestedUserId
        }

        if (mustMatchToken) {
            if (requestedUserId != req.userId && !req.isAdministrator) {
                res.status(400).send(`User ID in URL must match your user id '${req.userId}'.`)
                return null
            }
        }

        return requestedUserId
    }

    private readonly validatePromptIdParameter = (req: Request, res: Response, validateBody: boolean = false): number | null => {
        const requestedPrompt = req.params["promptid"]
        if (!requestedPrompt) {
            res.status(400).send("Missing 'promptid' parameter.")
            return null
        }

        const requestedPromptId = parseInt(requestedPrompt)

        if (isNaN(requestedPromptId)) {
            res.status(400).send("Prompt ID must be an integer.")
            return null
        }

        if (validateBody) {
            const prompt = req.body as Prompt
            if (requestedPromptId !== prompt.promptid && prompt.promptid !== undefined) {
                res.status(400).send("Prompt ID must match promptid in body if it is included in body.")
                return null
            }
            (req.body as Prompt).promptid = requestedPromptId
        }

        return requestedPromptId
    }
}