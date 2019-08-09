import BaseError from './BaseError';

class DisallowedError extends BaseError {
  constructor(message?: string | Error) {
    super('DISALLOWED_ERROR', message);
  }
}

export default DisallowedError;
