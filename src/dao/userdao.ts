import { randomUUID, UUID } from "crypto";
import { Pool } from "pg";
import { User } from "../models/user";
import { hashPassword, verifyPassword } from "../utils/hash";


export class UserDao {
    private pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    public async getUsers(): Promise<User[]> {
        const results = await this.pool.query("SELECT * FROM user")
        return results.rows as User[]
    }

    public async getUserByKey(api_key: UUID): Promise<User | null> {
        const hashedApiKey = await hashPassword(api_key)
        const results = await this.pool.query("SELECT * FROM user WHERE apiKeyHash = $1", [hashedApiKey])
        if (results.rowCount === 0)  {
            return null
        }
        return results.rows[0] as User
    }

    public async getUserByEmail(email: string): Promise<User | null> {
        const results = await this.pool.query("SELECT * FROM user WHERE email = $1", [email])
        if (results.rowCount === 0)  {
            return null
        }
        return results.rows[0] as User
    }

    public async createUser(email: string, password: string): Promise<string> {
        const apiKey = randomUUID()
        const passwordHash = await hashPassword(password)
        const apiKeyHash = await hashPassword(apiKey)
        await this.pool.query(
            `
            INSERT INTO user (email, passwordHash, apiKeyHash, requestCount) 
            VALUES ($1, $2, $3, 0)
            `,
            [email, passwordHash, apiKeyHash]
        )
        return apiKey
    }

    public async verifyUser(email: string, password: string): Promise<boolean> {
        const results = await this.pool.query("SELECT * from user WHERE email = $1", [email])

        if (results.rowCount === 0)  {
            return false
        }

        const user = results.rows[0] as User
        return await verifyPassword(user.passwordHash, password)
    }
}