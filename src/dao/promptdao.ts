import type { Pool } from "pg";
import type { Prompt } from "../models/prompt.ts";


export class PromptDao {
    private pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    public readonly getPrompts = async (): Promise<Prompt[]> => {
        const results = await this.pool.query(`
            SELECT *
            FROM prompts
            `
            )
        return results.rows as Prompt[]
    }

    /**
     * Get all the prompts for a given user.
     */
    public readonly getPromptsForUser = async (userId: number): Promise<Prompt[]> => {

        const results = await this.pool.query(`
            SELECT *
            FROM prompts
            WHERE userid = $1
            `, 
            [userId]
        )

        return results.rows as Prompt[]
    }

    /**
     * Get a prompt, identified by a prompt ID and user ID.
     * @throws {PromptNotFound}
     */
    public readonly getPrompt = async (promptId: number, userId: number): Promise<Prompt> => {
        const results = await this.pool.query(`
            SELECT *
            FROM prompts
            WHERE promptid = $1 AND userid = $2
            `, 
            [promptId, userId]
        )

        if (results.rowCount === 0)  {
            throw new PromptNotFound
        }

        const result = results.rows[0]
        return result as Prompt
    }

    /**
     * Save a new prompt.
     * @throws {BadPrompt}
     * @throws {DuplicatePrompt}
     */
    public readonly createPrompt = async (prompt: Prompt) => {
        try {
            await this.pool.query(
                `
                INSERT INTO prompts (userid, title, prompt) VALUES
                ($1, $2, $3)
                `, 
                [prompt.userid, prompt.title, prompt.prompt]
            )
        } catch (err) {
            if ((err as { code: string }).code === '23505') {
                throw new DuplicatePrompt
            }

            console.error(err)
            throw new BadPrompt
        }
    }

    /**
     * Delete the given prompt identified by a prompt ID and user ID.
     * @throws {PromptNotFound}
     * @throws {BadPrompt}
     */
    public readonly deletePrompt = async (promptId: number, userId: number) => {
        try {
            const results = await this.pool.query(
                `
                DELETE FROM prompts
                WHERE promptid = $1 AND userid = $2
                RETURNING promptid
                `, 
                [promptId, userId]
            )
            if (results.rowCount === 0) {
                throw new PromptNotFound
            }
        } catch (err) {
            if (!(err instanceof PromptNotFound)) {
                console.error(err)
                throw new BadPrompt
            } else {
                throw err
            }
        }
    }

    /**
     * Update an existing prompt.
     * @throws {PromptNotFound}
     * @throws {BadPrompt}
     */
    public readonly updatePrompt = async (prompt: Prompt) => {
        try {
            const results = await this.pool.query(
                `
                UPDATE prompts
                SET title = $1,
                    prompt = $2
                WHERE promptid = $3 AND userid = $4
                RETURNING promptid
                `, [prompt.title, prompt.prompt, prompt.promptid, prompt.userid]
            )
            if (results.rowCount === 0) {
                throw new PromptNotFound
            }

        } catch (err) {
            if (!(err instanceof PromptNotFound)) {
                console.error(err)
                throw new BadPrompt
            } else {
                throw err
            }
        }
    }
}

export class DuplicatePrompt extends Error {}
export class BadPrompt extends Error {}
export class PromptNotFound extends Error {}