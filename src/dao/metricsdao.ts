import type { Pool, QueryResult } from "pg";
import type {Request, Response} from 'express';


export class MetricsDao {
    private pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    readonly getMetrics = async (): Promise<any[]> => {
        const results = await this.pool.query(
            `
            SELECT method, endpoint, SUM(requestCount) AS requests
            FROM activity_metrics
            GROUP BY (method, endpoint)
            `
        )
        const metrics = results.rows
        return metrics
    }

    readonly getMetricsByUser = async (): Promise<any[]> => {
        const results = await this.pool.query(
            `
            SELECT u.username, u.email, sum(requestCount) AS requests
            FROM activity_metrics AS am
            LEFT JOIN users AS u ON u.id = am.userid
            GROUP BY (u.username, u.email)
            `
        )
        const metrics = results.rows
        return metrics
    }

    readonly submitOrUpdateMetric = async (req: Request) => {
        const method = req.method
        const endpoint = req.originalUrl
        const user_id = req.userId
        await this.pool.query(
            `
            INSERT INTO activity_metrics (method, endpoint, userid)
            VALUES ($1, $2, $3)
            ON CONFLICT (method, endpoint, userid)
                DO UPDATE SET
                requestCount = activity_metrics.requestCount + 1
            `,
            [method, endpoint, user_id]
        )
    }
}