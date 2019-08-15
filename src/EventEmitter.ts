type Listener<Args extends Array<any> = any[]> = (...args: Args) => Promise<void>;

class EventEmitter {
  private _listeners: {[name: string]: Listener[]}

  constructor() {
    this._listeners = {};
  }

  protected async emit(type: string, ...args: any[]) {
    if (this._listeners[type]) {
      await Promise.all(this._listeners[type].map(listener => listener(...args)));
    }
  }

  on(name: string, listener: Listener) {
    if (!this._listeners[name]) {
      this._listeners[name] = [];
    }
    this._listeners[name].push(listener);
  }
}

export {
  Listener,
};

export default EventEmitter;
