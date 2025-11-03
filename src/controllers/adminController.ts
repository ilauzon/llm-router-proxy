import type { Request, Response } from 'express';
import type { User } from '../models/user.ts';
import type { UUID } from 'node:crypto';
import type { Pool } from 'pg';
import { UserDao } from '../dao/userdao.ts';

export class AdminController {
    private pool: Pool
    private userDao: UserDao

    constructor(pool: Pool) {
        this.pool = pool
        this.userDao = new UserDao(this.pool)
    }

    readonly getUsers = async (req: Request, res: Response) => {
        const users = this.userDao.getUsers()
        res.json(users)
    }

    readonly getUserByKey = async (req: Request, res: Response) => {
        // const user: User | null = await this.userDao.getUserByKey(api_key)
        res.json(null)
    }

    readonly getUserByEmail = async (req: Request, res: Response) => {
        // const user: User | null = await this.userDao.getUserByEmail(email)
        res.json(null)
    }
}