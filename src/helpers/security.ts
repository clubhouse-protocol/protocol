const sha512 = require('js-sha512').sha512;

export const hash = async (input: string) => sha512(input);

export const hmac = async (input: string, secret: string) => sha512.hmac(secret, input);
