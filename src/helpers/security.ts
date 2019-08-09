const sha512 = require('sha512');

export const hash = async (input: string) => sha512(input).toString('hex');

export const hmac = (input: string, secret: string) => sha512.hmac(secret).finalize(input).toString('hex');
