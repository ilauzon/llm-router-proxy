import type { Request, Response } from 'express';
import type { PromptDao } from "../dao/promptdao.ts";
import type { Prompt } from '../models/prompt.ts';
import { BadPrompt, DuplicatePrompt, PromptNotFound } from '../dao/promptdao.ts';
import { fmt } from '../lang/fmt.ts';
import { MISSING_PARAMETER, PARAMETER_MUST_BE_INTEGER, PARAMETER_MUST_MATCH_BODY, PARAMETERS_MUST_MATCH_AUTH } from '../lang/en.ts';


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
            res.status(400).send(fmt(MISSING_PARAMETER, "userid"))
            return null
        }

        const requestedUserId = parseInt(requestedUser)

        if (isNaN(requestedUserId)) {
            res.status(400).send(fmt(PARAMETER_MUST_BE_INTEGER, "userid"))
            return null
        }

        if (validateBody) {
            const prompt = req.body as Prompt
            if (requestedUserId !== prompt.userid && prompt.userid !== undefined) {
                res.status(400).send(fmt(PARAMETER_MUST_MATCH_BODY, "userid"))
                return null
            }
            (req.body as Prompt).userid = requestedUserId
        }

        if (mustMatchToken) {
            if (requestedUserId != req.userId && !req.isAdministrator) {
                res.status(403).send(fmt(PARAMETERS_MUST_MATCH_AUTH, "userid", req.userId))
                return null
            }
        }

        return requestedUserId
    }

    private readonly validatePromptIdParameter = (req: Request, res: Response, validateBody: boolean = false): number | null => {
        const requestedPrompt = req.params["promptid"]
        if (!requestedPrompt) {
            res.status(400).send(fmt(MISSING_PARAMETER, "promptid"))
            return null
        }

        const requestedPromptId = parseInt(requestedPrompt)

        if (isNaN(requestedPromptId)) {
            res.status(400).send(fmt(PARAMETER_MUST_BE_INTEGER, "promptid"))
            return null
        }

        if (validateBody) {
            const prompt = req.body as Prompt
            if (requestedPromptId !== prompt.promptid && prompt.promptid !== undefined) {
                res.status(400).send(fmt(PARAMETER_MUST_MATCH_BODY, "promptid"))
                return null
            }
            (req.body as Prompt).promptid = requestedPromptId
        }

        return requestedPromptId
    }
}