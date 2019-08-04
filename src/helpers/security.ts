export const hash = (input: string) => `${input}a`; // TODO: update to hash algoritm

export const hmac = (input: string, secret: string) => `${input}${secret}a`; // TODO: update to hmac algoritm
