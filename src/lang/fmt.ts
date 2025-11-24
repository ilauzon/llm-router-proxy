export const fmt = (str: string, ...params: any[]) => {
    for (let i = 0; i < params.length; i++) {
        const param = params[i]
        str.replaceAll(`\$${i}`, param)
    }
    return str
}