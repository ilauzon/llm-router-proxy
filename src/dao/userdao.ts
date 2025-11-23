import { randomUUID } from "crypto";
import type { UUID } from "crypto";
import type { Pool } from "pg";
import type { User } from "../models/user.ts";
import { hashApiKey, hashPassword, verifyPassword } from "../utils/hash.ts";


export class UserDao {
    private pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    public readonly getUsers = async (): Promise<User[]> => {
        const results = await this.pool.query(`
            SELECT u.id, u.email, u.isAdministrator, ua.requestCount 
            FROM users AS u
            LEFT JOIN user_api_usages AS ua ON u.id = ua.id
            `
            )
        for (const row of results.rows) {
            delete row.passwordhash
            delete row.apikeyhash
        }
        return results.rows as User[]
    }

    public readonly getUserById = async (id: number): Promise<User | null> => {
        const results = await this.pool.query(`
            SELECT u.id, u.email, u.isAdministrator, ua.requestCount 
            FROM users AS u
            LEFT JOIN user_api_usages AS ua ON u.id = ua.id
            WHERE u.id = $1
            `, 
            [id]
        )
        if (results.rowCount === 0)  {
            return null
        }
        const result = results.rows[0]
        delete result.passwordhash
        delete result.apikeyhash
        return result as User
    }

    public readonly getUserByKey = async (apiKey: UUID): Promise<User | null> => {
        const hashedApiKey = hashApiKey(apiKey)
        const results = await this.pool.query(`
            SELECT u.id, u.email, u.isAdministrator, ua.requestCount 
            FROM users AS u
            LEFT JOIN user_api_usages AS ua ON u.id = ua.id
            WHERE apiKeyHash = $1
            `, 
            [hashedApiKey]
        )
        if (results.rowCount === 0)  {
            return null
        }
        const result = results.rows[0]
        delete result.passwordhash
        delete result.apikeyhash
        return result as User
    }

    public readonly getUserByEmail = async (email: string): Promise<User | null> => {
        const results = await this.pool.query(
            `
            SELECT u.id, u.email, u.isAdministrator, ua.requestCount 
            FROM users AS u
            LEFT JOIN user_api_usages AS ua ON u.id = ua.id
            WHERE email = $1
            `, 
            [email]
        )

        if (results.rowCount === 0)  {
            return null
        }
        const result = results.rows[0]
        delete result.passwordhash
        delete result.apikeyhash
        return result as User
    }

    public readonly createUser = async (email: string, password: string, isAdministrator: boolean): Promise<string> => {
        const apiKey = randomUUID()
        const passwordHash = await hashPassword(password)
        const apiKeyHash = hashApiKey(apiKey)
        const client = await this.pool.connect()
        try {
            await client.query("BEGIN")
            const result = await client.query(
                `
                INSERT INTO users (email, passwordHash, apiKeyHash, isAdministrator) 
                VALUES ($1, $2, $3, $4)
                RETURNING id
                `,
                [email, passwordHash, apiKeyHash, isAdministrator]
            )
            const newId = result.rows[0].id
            await client.query(
                `
                INSERT INTO user_api_usages (id, requestCount)
                VALUES ($1, $2)
                `,
                [newId, 0]
            )
            await client.query("COMMIT")
        } catch (err) {
            await client.query("ROLLBACK")
            throw new DuplicateEmailError(`Email ${email} is taken.`)
        } finally {
            client.release()
        }
        return apiKey
    }

    public readonly verifyUser = async (email: string, password: string): Promise<boolean> => {
        const results = await this.pool.query(
            `
            SELECT * from users WHERE email = $1
            `, 
            [email]
        )

        if (results.rowCount === 0)  {
            return false
        }

        const user = results.rows[0]
        return await verifyPassword(user.passwordhash, password)
    }

    public readonly incrementUserRequestCount = async (id: number) => {
        await this.pool.query(
            `
            UPDATE user_api_usages
            SET requestCount = requestCount + 1
            WHERE id = $1
            `, [id]
        )
    }
}

export class DuplicateEmailError extends Error {}