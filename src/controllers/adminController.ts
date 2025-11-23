import type { Request, Response } from 'express';
import type { Pool } from 'pg';
import { UserDao } from '../dao/userdao.ts';
import type { MetricsDao } from '../dao/metricsdao.ts';

export class AdminController {
    private userDao: UserDao
    private metricsDao: MetricsDao

    constructor(userDao: UserDao, metricsDao: MetricsDao) {
        this.userDao = userDao
        this.metricsDao = metricsDao
    }

    readonly getUsers = async (req: Request, res: Response) => {
        const users = await this.userDao.getUsers()
        res.json(users)
    }

    readonly getUsageMetrics = async (req: Request, res: Response) => {
        const metrics = await this.metricsDao.getMetrics()
        res.json(metrics)
    }
}