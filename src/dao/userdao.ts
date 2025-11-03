import { randomUUID } from "crypto";
import type { UUID } from "crypto";
import type { Pool } from "pg";
import type { User } from "../models/user.ts";
import { hashPassword, verifyPassword } from "../utils/hash.ts";


export class UserDao {
    private pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    public async getUsers(): Promise<User[]> {
        const results = await this.pool.query("SELECT * FROM users")
        for (const row of results.rows) {
            delete row.passwordhash
            delete row.apikeyhash
        }
        console.log(results.rows)
        return results.rows as User[]
    }

    public async getUserById(id: number): Promise<User | null> {
        const results = await this.pool.query("SELECT * FROM users WHERE id = $1", [id])
        if (results.rowCount === 0)  {
            return null
        }
        const result = results.rows[0]
        delete result.passwordhash
        delete result.apikeyhash
        return result as User
    }

    public async getUserByKey(api_key: UUID): Promise<User | null> {
        const hashedApiKey = await hashPassword(api_key)
        const results = await this.pool.query("SELECT * FROM users WHERE apiKeyHash = $1", [hashedApiKey])
        if (results.rowCount === 0)  {
            return null
        }
        const result = results.rows[0]
        delete result.passwordhash
        delete result.apikeyhash
        return result as User
    }

    public async getUserByEmail(email: string): Promise<User | null> {
        const results = await this.pool.query("SELECT * FROM users WHERE email = $1", [email])
        if (results.rowCount === 0)  {
            return null
        }
        const result = results.rows[0]
        delete result.passwordhash
        delete result.apikeyhash
        return result as User
    }

    public async createUser(email: string, password: string, isAdministrator: boolean): Promise<string> {
        const apiKey = randomUUID()
        const passwordHash = await hashPassword(password)
        const apiKeyHash = await hashPassword(apiKey)
        try {
            await this.pool.query(
                `
                INSERT INTO users (email, passwordHash, apiKeyHash, isAdministrator, requestCount) 
                VALUES ($1, $2, $3, $4, 0)
                `,
                [email, passwordHash, apiKeyHash, isAdministrator]
            )
        } catch (err) {
            throw new DuplicateEmailError(`Email ${email} is taken.`)
        }
        return apiKey
    }

    public async verifyUser(email: string, password: string): Promise<boolean> {
        const results = await this.pool.query("SELECT * from users WHERE email = $1", [email])

        if (results.rowCount === 0)  {
            return false
        }

        const user = results.rows[0]
        return await verifyPassword(user.passwordhash, password)
    }
}

export class DuplicateEmailError extends Error {}