import type { Request, Response } from 'express'
import type { Pool } from 'pg';
import { DuplicateEmailError, UserDao } from '../dao/userdao.ts';
import type { JwtService } from '../services/jwtservice.ts';
import { ref } from 'process';

export class AuthController {
    private userDao: UserDao
    private jwtService: JwtService
    public static readonly ACCESS_TOKEN_COOKIE: string = "accessToken"
    public static readonly REFRESH_TOKEN_COOKIE: string = "refreshToken"

    constructor(pool: Pool, jwtService: JwtService) {
        this.userDao = new UserDao(pool)
        this.jwtService = jwtService
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
            const refreshToken = this.jwtService.getNewRefreshToken(user.id, user.isadministrator)
            const accessToken = this.jwtService.refresh(refreshToken)!

            res.cookie(AuthController.REFRESH_TOKEN_COOKIE, refreshToken)
            res.cookie(AuthController.ACCESS_TOKEN_COOKIE, accessToken)

            return res.status(200).send("Logged in successfully")
        } else {
            return res.status(401).send("Invalid email or password")
        }
    }

    readonly refresh = async (req: Request, res: Response) => {
        const refreshToken = req.cookies[AuthController.REFRESH_TOKEN_COOKIE]

        if (!refreshToken) {
            return res.status(401).send("Refresh token not provided.")
        }

        const newAccessToken = this.jwtService.refresh(refreshToken)
        res.cookie(AuthController.ACCESS_TOKEN_COOKIE, newAccessToken)
        return res.send()
    }

    readonly logout = async (req: Request, res: Response) => {
        const refreshToken = req.cookies["refreshToken"]
        this.jwtService.revoke(refreshToken)

        res.clearCookie(AuthController.ACCESS_TOKEN_COOKIE)
        res.clearCookie(AuthController.REFRESH_TOKEN_COOKIE)

        return res.status(200).send("Logged out successfully")
    }

    readonly newApiKey = async (req: Request, res: Response) => {
        throw new Error("Not implemented")
    }

    readonly getMyInfo = async (req: Request, res: Response) => {
        const user = await this.userDao.getUserById(req.userId!)
        if (!user) return res.status(404).send("User not found")
        return res.json(user)
    }
}