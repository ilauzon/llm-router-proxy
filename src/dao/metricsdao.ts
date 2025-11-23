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
            SELECT *
            FROM activity_metrics
            `
        )
        const metrics = results.rows
        for (const metric of metrics) {
            delete metric.id
        }
        return metrics
    }

    readonly submitOrUpdateMetric = async (req: Request) => {
        const method = req.method
        const endpoint = req.path
        await this.pool.query(
            `
            INSERT INTO activity_metrics (method, endpoint)
            VALUES ($1, $2)
            ON CONFLICT (method, endpoint)
                DO UPDATE SET
                requestCount = activity_metrics.requestCount + 1
            `,
            [method, endpoint]
        )
    }
}