import express from 'express'
import session from 'express-session'
import cors from 'cors'
import type { Application, Request, Response, NextFunction, Errback } from 'express'
import { createAdminRouter } from './routes/adminRoutes.ts'
import { Pool } from 'pg'
import { UserDao } from "./dao/userdao.ts"
import { createAuthRouter } from './routes/authRoutes.ts'


const app: Application = express()
const PORT = process.env.PORT || 3000
const dbService: Pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: 'localhost',
    port: 5432,
    database: process.env.POSTGRES_DATABASE,
    max: 20,
})

const userDao: UserDao = new UserDao(dbService)

try {
    await userDao.createUser(process.env.ADMIN_USERNAME!, process.env.ADMIN_PASSWORD!, true)
} catch (error) {
    console.log(`user '${process.env.ADMIN_USERNAME}' already exists. Skipping creation.`)
}

app.use(express.json())

const corsOptions = {
    credentials: true,
    origin: '*'
}

app.set('trust proxy', 1)
app.use(cors(corsOptions))
app.use(session({
    secret: process.env.SESSION_COOKIE_SALT!,
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
    },
}))

app.use("/admin", createAdminRouter(dbService))

app.use("/auth", createAuthRouter(dbService))

app.listen(PORT, () => console.log(`Listening on port ${PORT}.`))
