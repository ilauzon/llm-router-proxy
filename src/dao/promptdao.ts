import type { Pool } from "pg";
import type { Prompt } from "../models/prompt.ts";


export class PromptDao {
    private pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    public async getPrompts(): Promise<Prompt[]> {
        const results = await this.pool.query(`
            SELECT *
            FROM prompts
            `
            )
        return results.rows as Prompt[]
    }

    public async getPromptsForUser(userId: number): Promise<Prompt[]> {

        const results = await this.pool.query(`
            SELECT *
            FROM prompts
            WHERE userid = $1
            `, 
            [userId]
        )

        return results.rows as Prompt[]
    }

    public async getPrompt(promptId: number, userId: number): Promise<Prompt | null> {
        const results = await this.pool.query(`
            SELECT *
            FROM prompts
            WHERE promptid = $1 AND userid = $2
            `, 
            [promptId, userId]
        )

        if (results.rowCount === 0)  {
            return null
        }

        const result = results.rows[0]
        return result as Prompt
    }

    public async createPrompt(prompt: Prompt): Promise<boolean> {
        try {
            await this.pool.query(
                `
                INSERT INTO prompts (userid, title, prompt) VALUES
                ($1, $2, $3)
                `, 
                [prompt.userid, prompt.title, prompt.prompt]
            )
        } catch (err) {
            console.error(err)
            return false
        }
        return true
    }

    public async deletePrompt(promptId: number, userId: number): Promise<boolean> {
        try {
            await this.pool.query(
                `
                DELETE FROM prompts
                WHERE promptid = $1 AND userid = $2
                `, 
                [promptId, userId]
            )
        } catch (err) {
            console.error(err)
            return false
        }
        return true
    }

    public async updatePrompt(prompt: Prompt) {
        try {
            await this.pool.query(
                `
                UPDATE prompts
                SET title = $1,
                    prompt = $2
                WHERE promptid = $1 AND userid = $2
                `, [prompt.promptid, prompt.userid]
            )
        } catch (err) {
            console.error(err)
            return false
        }
        return true
    }
}

export class DuplicateEmailError extends Error {}