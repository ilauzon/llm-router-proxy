import * as argon2 from 'argon2'
import * as crypto from 'crypto'

export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password)
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
    return await argon2.verify(hash, password)
}

export function hashApiKey(apiKey: string): string {
    const hash = crypto.createHash('md5')
    hash.update(apiKey)
    return hash.digest('hex')
}