import type { Request, Response } from 'express'
import { User } from '../models/user';
import { Pool } from 'pg';
import { UserDao } from '../dao/userdao';

export class AuthController {
    private userDao: UserDao

    constructor(pool: Pool) {
        this.userDao = new UserDao(pool)
    }

    public async register(req: Request, res: Response) {
        const { email, password } = req.body
        const apiKey = await this.userDao.createUser(email, password)
        return res.json({ apiKey: apiKey })
    }
    
    public async login(req: Request, res: Response) {
        const { email, password } = req.body
        const success = await this.userDao.verifyUser(email, password)
        if (success) {
            const user = (await this.userDao.getUserByEmail(email))!
            req.session.userId = user.id
            return res.status(200).send("Logged in successfully")
        } else {
            return res.status(401).send("Invalid email or password")
        }
    }

    public async logout(req: Request, res: Response) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send("Logout failed")
            }
            res.clearCookie("connect.sid")
            return res.status(200).send("Logged out successfully")
        })
    }

    public async newApiKey(req: Request, res: Response) {
        // authenticate user
        throw new Error("Not implemented")
    }

    public async getMyInfo(req: Request, res: Response): Promise<User> {
        // authenticate user
        throw new Error("Not implemented")
    }
}