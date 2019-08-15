import BaseError from './BaseError';

class InvalidError extends BaseError {
  constructor(message?: string | Error) {
    super('INVALID_ERROR', message);
  }
}

export default InvalidError;
