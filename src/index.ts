import express from 'express'
import session from 'express-session'
import cors from 'cors'
import type { Application, NextFunction, Request, Response } from 'express'
import { createAdminRouter } from './routes/adminRoutes'
import { Pool } from 'pg'
import { UserDao } from './dao/userdao'
import { UUID } from 'crypto'

const app: Application = express()
const PORT = process.env.PORT || 3000
const dbService: Pool = new Pool()
const userDao: UserDao = new UserDao(dbService)

app.use(express.json())

const corsOptions = {
    credentials: true,
    origin: '*'
}

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

app.use("/service")

app.get("/", (req: Request, res: Response) => {

})