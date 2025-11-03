export interface User {
    id: number,
    email: string,
    passwordhash: string,
    apikeyhash: string,
    isadministrator: boolean,
    requestCount: number,
}
