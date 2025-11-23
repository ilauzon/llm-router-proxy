import { UserDao } from "../dao/userdao.ts";
import type { Request, Response } from 'express';
import type { Pool } from "pg";

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
            return res.status(400).send("Missing 'prompt' and/or 'max_tokens' from body.")
        }

        const response = await fetch(`${this.origin}/generate?prompt=${encodeURIComponent(prompt)}&max_tokens=${max_tokens}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`
            }
        })
        if (response.ok) {
            const user = await this.userDao.getUserByKey(req.apiKey!)
            this.userDao.incrementUserRequestCount(user!.id)
            const data = await response.json()
            return res.json(data)
        } else {
            console.error(response.status, response.body)
            res.status(500).send("Error encountered with LLM service.")
        }
    }
}