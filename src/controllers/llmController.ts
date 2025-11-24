import { UserDao } from "../dao/userdao.ts";
import type { Request, Response } from 'express';
import type { Pool } from "pg";
import { API_LIMIT_EXCEEDED, ERROR_ENCOUNTERED_WITH_LLM_SERVICE, INVALID_LLM_REQUEST } from "../lang/en.ts";
import { fmt } from "../lang/fmt.ts";

export class LlmController {
    private readonly userDao: UserDao
    readonly origin: string
    private readonly apiKey: string

    constructor(pool: Pool, origin: string, apiKey: string) {
        this.userDao = new UserDao(pool)
        this.origin = origin
        this.apiKey = apiKey
    }

    readonly ask = async (req: Request, res: Response) => {
        const { prompt, max_tokens } = req.body

        if (prompt === undefined || max_tokens === undefined) {
            return res.status(400).send(INVALID_LLM_REQUEST)
        }

        const response = await fetch(`${this.origin}/generate?prompt=${encodeURIComponent(prompt)}&max_tokens=${max_tokens}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`
            }
        })
        if (response.ok) {
            let user = (await this.userDao.getUserByKey(req.apiKey!))!
            this.userDao.incrementUserRequestCount(user!.id)
            const requestCount = user.requestcount + 1

            const data = (await response.json()) as { prompt: string, response: string, warning?: string }

            if (requestCount > 20) {
                data.warning = fmt(API_LIMIT_EXCEEDED, requestCount)
            }

            return res.json(data)
        } else {
            console.error(response.status, response.body)
            res.status(500).send(ERROR_ENCOUNTERED_WITH_LLM_SERVICE)
        }
    }
}