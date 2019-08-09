class BaseError extends Error {
  private _type: string;
  private _baseError?: Error;

  constructor(type: string, baseError?: string | Error) {
    if (baseError instanceof Error) {
      super(baseError.message);
      this._baseError = baseError;
    } else {
      super(type || baseError);
    }
    this._type = type;
  }

  get type() {
    return this._type;
  }

  get baseError() {
    return this._baseError;
  }
}

export default BaseError;
