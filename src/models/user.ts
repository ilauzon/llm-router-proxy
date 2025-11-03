export interface User {
    id: number,
    email: string,
    passwordHash: string,
    apiKeyHash: string,
    requestCount: number,
}
