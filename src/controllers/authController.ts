import type { Request, Response } from 'express'
import type { Pool } from 'pg';
import { DuplicateEmailError, DuplicateUsernameError, InvalidEmailFormatError, UserDao } from '../dao/userdao.ts';
import type { JwtService } from '../services/jwtservice.ts';
import { INVALID_EMAIL_OR_PASSWORD, LOGGED_IN_SUCCESSFULLY, LOGGED_OUT_SUCCESSFULLY, REFRESH_TOKEN_NOT_PROVIDED, USER_NOT_FOUND, USERNAME_MUST_BE_A_STRING } from '../lang/en.ts';

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
            } else if (err instanceof InvalidEmailFormatError) {
                return res.status(400).send(err.message)
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

            res.cookie(AuthController.REFRESH_TOKEN_COOKIE, refreshToken, { httpOnly: true, sameSite: "none" })
            res.cookie(AuthController.ACCESS_TOKEN_COOKIE, accessToken, { httpOnly: true, sameSite: "none" })

            return res.status(200).send(LOGGED_IN_SUCCESSFULLY)
        } else {
            return res.status(401).send(INVALID_EMAIL_OR_PASSWORD)
        }
    }

    readonly refresh = async (req: Request, res: Response) => {
        const refreshToken = req.cookies[AuthController.REFRESH_TOKEN_COOKIE]

        if (!refreshToken) {
            return res.status(401).send(REFRESH_TOKEN_NOT_PROVIDED)
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

        return res.status(200).send(LOGGED_OUT_SUCCESSFULLY)
    }

    readonly newApiKey = async (req: Request, res: Response) => {
        const apiKey = await this.userDao.changeApiKey(req.userId!)
        res.json({ apiKey })
    }

    readonly getMyInfo = async (req: Request, res: Response) => {
        const user = await this.userDao.getUserById(req.userId!)
        if (!user) return res.status(404).send(USER_NOT_FOUND)
        return res.json(user)
    }

    readonly changeUsername = async (req: Request, res: Response) => {
        const username = req.body["username"]
        if (typeof username !== "string") {
            return res.status(400).send(USERNAME_MUST_BE_A_STRING)
        }
        try {
            await this.userDao.changeUsername(req.userId!, username)
        } catch (err) {
            if (err instanceof DuplicateUsernameError) {
                return res.status(409).send(err.message)
            } else {
                throw err
            }
        }
        return res.sendStatus(204)
    }
}