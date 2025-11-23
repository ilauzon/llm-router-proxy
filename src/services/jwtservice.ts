import e from 'express';
import jwt from 'jsonwebtoken';
const { TokenExpiredError } = jwt;


export class JwtService {

    private accessSecret: string
    private refreshSecret: string
    private refreshTokens: Set<string> = new Set()

    constructor(accessSecret: string, refreshSecret: string) {
        this.accessSecret = accessSecret
        this.refreshSecret = refreshSecret
    }
    
    /**
     * Verify the given access token.
     * @param accessToken 
     * @returns the user's information if the token is valid, null if otherwise.
     */
    readonly verify = (accessToken: string): { userId: number, isAdministrator: boolean } | null => {
        let payload;
        try {
            payload = jwt.verify(accessToken, this.accessSecret) as jwt.JwtPayload
        } catch (err) {
            if (!(err instanceof TokenExpiredError)) {
                console.error(err)
            }
            return null
        }

        return payload as { userId: number, isAdministrator: boolean } 
    }

    /**
     * Issue a new access token that expires in 15 minutes.
     * 
     * @param refreshToken 
     * @returns The access token if the refresh token is valid, otherwise null.
     */
    readonly refresh = (refreshToken: string): string | null => {
        let payload;
        try {
            payload = jwt.verify(refreshToken, this.refreshSecret) as jwt.JwtPayload
        } catch (err) {
            console.error(err)
            return null
        }

        if (!this.refreshTokens.has(refreshToken)) {
            return null
        }

        const newAccessToken = jwt.sign(
            payload,
            this.accessSecret, 
            {expiresIn: '15m'},
        )

        return newAccessToken
    }

    /**
     * Revoke a refresh token, forcing login with username + password.
     * @param refreshToken the refresh token to be revoked.
     * @returns true if the revocation was successful, false if the token was already revoked.
     */
    readonly revoke = (refreshToken: string): boolean => {
        return this.refreshTokens.delete(refreshToken)
    }

    /**
     * Get a new refresh token for the given user.
     * @param userId The ID of the user to sign.
     * @param isAdministrator True if the user is an administrator, false otherwise.
     * @returns the new refresh token.
     */
    readonly getNewRefreshToken = (userId: number, isAdministrator: boolean): string => {
        const newRefreshToken = jwt.sign(
            { "userId": userId, "isAdministrator": isAdministrator },
            this.refreshSecret, 
        )

        this.refreshTokens.add(newRefreshToken)

        return newRefreshToken
    }
}