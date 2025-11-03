import type { Request, Response } from 'express'
import type { User } from '../models/user.ts';
import type { Pool } from 'pg';
import { DuplicateEmailError, UserDao } from '../dao/userdao.ts';

export class AuthController {
    private userDao: UserDao

    constructor(pool: Pool) {
        this.userDao = new UserDao(pool)
    }

    readonly register = async (req: Request, res: Response) => {
        const { email, password } = req.body
        let apiKey: string;
        try {
            apiKey = await this.userDao.createUser(email, password, false)
        } catch (err) {
            if (err instanceof DuplicateEmailError) {
                return res.status(409).send(err.message)
            } else {
                throw err
            }
        }
        return res.json({ apiKey: apiKey })
    }
    
    readonly login = async (req: Request, res: Response) => {
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

    readonly logout = async (req: Request, res: Response) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send("Logout failed")
            }
            res.clearCookie("connect.sid")
            return res.status(200).send("Logged out successfully")
        })
    }

    readonly newApiKey = async (req: Request, res: Response) => {
        throw new Error("Not implemented")
    }

    readonly getMyInfo = async (req: Request, res: Response) => {
        const user = await this.userDao.getUserById(req.session.userId!)
        if (!user) return res.status(404).send("User not found")
        res.json(user)
    }
}