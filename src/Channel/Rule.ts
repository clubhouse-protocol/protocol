import EventEmitter, { Listener } from '../EventEmitter';

class Rule<RuleType = any> extends EventEmitter {
  private _rules: RuleType;
  private _type: string;

  constructor(type: string, rules: RuleType) {
    super();
    this._rules = rules;
    this._type = type;
  }

  set rules(rules: RuleType) {
    this._rules = rules;
    this.emit('update', this.type, this.rules);
  }

  get rules() {
    // TODO: ensure immutability
    return this._rules;
  }

  get type() {
    return this._type;
  }

  changeType<RuleType = any>(type: string, rules: RuleType) {
    this._type = type;
    this._rules = rules as any;
    this.emit('update', this.type, this.rules);
  }

  pack() {
    return {
      type: this.type,
      rules: this.rules,
    };
  }
}

declare interface Rule<RuleType = any> {
  on: (type: 'updated', listener: Listener<[string, RuleType]>) => void;
}

export default Rule;
