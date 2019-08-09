import EventEmitter from 'eventemitter3';
import Identity from '../Identity';

class Members extends EventEmitter {
  private _members: Identity[];

  constructor(members: Identity[]) {
    super();
    this._members = members;
  }

  async add(key: string) {
    const member = await Identity.open(key);
    this._members.push(member);
    this.emit('update');
  }

  async remove(key: string) {
    const member = await Identity.open(key);
    this._members = this._members.filter(m => m.fingerprint !== member.fingerprint);
    this.emit('update');
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

export default Members;
