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
        const users = await this.userDao.getUsers()
        res.json(users)
    }
}