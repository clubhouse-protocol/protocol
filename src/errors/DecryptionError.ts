import BaseError from './BaseError';

class DecryptionError extends BaseError {
  constructor(message?: string | Error) {
    super('DECRYPTION_ERROR', message);
  }
}

export default DecryptionError;
