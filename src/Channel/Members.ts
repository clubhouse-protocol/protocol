import Identity from '../Identity';
import EventEmitter, { Listener } from '../EventEmitter';
import { InvalidError } from '../errors';

class Members extends EventEmitter {
  private _members: Identity[];

  constructor(members: Identity[]) {
    super();
    this._members = members;
  }

  async add(key: string) {
    const member = await Identity.open(key);
    if (!member.validKey) {
      throw new InvalidError('Member key not valid');
    }
    this._members.push(member);
    await this.emit('updated', this._members);
  }

  async remove(key: string) {
    const member = await Identity.open(key);
    this._members = this._members.filter(m => m.fingerprint !== member.fingerprint);
    await this.emit('updated', this._members);
  }

  get all() {
    return this._members;
  }

  pack() {
    return this._members.map(m => m.publicKey.armor());
  }

  get length() {
    return this._members.length;
  }

  static async create(keys: string[]) {
    const members = await Promise.all(keys.map(member => Identity.open(member)));
    return new Members(members);
  }
}

declare interface Members {
  on: (type: 'updated', listener: Listener<[Identity[]]>) => void;
}

export default Members;
