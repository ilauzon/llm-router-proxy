import { Request, Response } from 'express';
import { User } from '../models/user';
import { UUID } from 'node:crypto';
import { Pool } from 'pg';
import { UserDao as UserDao } from '../dao/userdao';

export class AdminController {
    private pool: Pool
    private userDao: UserDao

    constructor(pool: Pool) {
        this.pool = pool
        this.userDao = new UserDao(this.pool)
    }

    public async getUsers(req: Request, res: Response): Promise<User[]> {
        const users = this.userDao.getUsers()
        return users
    }

    public async getUserByKey(api_key: UUID): Promise<User | null> {
        const user: User | null = await this.userDao.getUserByKey(api_key)
        return user
    }

    public async getUserByEmail(email: string): Promise<User | null> {
        const user: User | null = await this.userDao.getUserByEmail(email)
        return user
    }
}