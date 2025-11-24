import express from 'express'
import cookieParser from 'cookie-parser'
import type { Application, Request, Response, NextFunction, Errback } from 'express'
import { createAdminRouter } from './routes/adminRoutes.ts'
import { Pool } from 'pg'
import { UserDao } from "./dao/userdao.ts"
import { createAuthRouter } from './routes/authRoutes.ts'
import { AuthMiddleware } from './middleware/authMiddleware.ts';
import { createLlmRouter } from './routes/llmRoutes.ts'
import { JwtService } from "./services/jwtservice.ts"
import { createPromptRouter } from './routes/promptRoutes.ts'
import { PromptDao } from "./dao/promptdao.ts"
import { MetricsDao } from "./dao/metricsdao.ts"
import { swaggerSpec, swaggerUi } from './swagger/swagger.ts'
import { types } from 'pg'

types.setTypeParser(20, BigInt);

const app: Application = express()
const api = express.Router()
const PORT = process.env.PORT || 8111
const dbService: Pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    // Use Docker var 'db' if available, otherwise default to localhost
    host: process.env.DB_HOST || 'localhost', 
    port: 5432,
    database: process.env.POSTGRES_DATABASE,
    max: 20,
})

const userDao: UserDao = new UserDao(dbService)
const metricsDao: MetricsDao = new MetricsDao(dbService)
const promptDao: PromptDao = new PromptDao(dbService)
const jwtService: JwtService = new JwtService(process.env.JWT_SECRET!, process.env.REFRESH_SECRET!)
const authMiddleware: AuthMiddleware = new AuthMiddleware(userDao, metricsDao)

try {
    await userDao.createUser(process.env.ADMIN_USERNAME!, process.env.ADMIN_PASSWORD!, true)
} catch (error) {
    console.log(`user '${process.env.ADMIN_USERNAME}' already exists. Skipping creation.`)
}

app.use(express.json())

app.set('trust proxy', 1)

/**
 * CORS
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'https://ranveerrai.ca', 
    'http://localhost:8888', 
    'http://localhost:8889', 
    'http://localhost:8111', 
    'http://127.0.0.1:8888',
    'http://127.0.0.1:8889',
    'http://127.0.0.1:8111', 
]
  const defaultOrigin = 'https://ranveerrai.ca'
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
       res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', defaultOrigin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Origin, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  return next();
});

// send 400 on empty body when body was expected.
const canBeEmpty = ["/v1/auth/refresh", "/v1/auth/logout", "/v1/auth/new-key"]
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === "POST" || req.method === "PUT") {
        if (req.body === undefined && !canBeEmpty.includes(req.originalUrl)) {
            return res.status(400).send("Missing request body")
        }
    }
    next()
})

/**
 * Create res.cookie
 */
app.use(cookieParser())

/**
 * Use Swagger
 */
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Set req.userId if the user has provided a valid access token.
 */
api.use((req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies["accessToken"]

    if (!accessToken) {
        next()
        return
    }

    const payload = jwtService.verify(accessToken)

    if (payload === null) {
        next()
        return
    }

    req.userId = payload.userId
    req.isAdministrator = payload.isAdministrator
    
    next()
})

api.use("/admin", createAdminRouter(userDao, metricsDao, authMiddleware))
api.use("/auth", createAuthRouter(dbService, jwtService, authMiddleware))
api.use("/api", createLlmRouter(dbService, authMiddleware, process.env.REMOTE_LLM_ORIGIN!, process.env.REMOTE_LLM_API_KEY!))
api.use("/prompts", createPromptRouter(promptDao, authMiddleware))

app.use("/v1", api)
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`))
