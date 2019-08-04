import Identity from '../Identity';

class Members {
  private _members: Identity[];

  constructor(members: Identity[]) {
    this._members = members;
  }

  async add(key: string) {
    const member = await Identity.open(key);
    this._members.push(member);
  }

  async remove(key: string) {
    const member = await Identity.open(key);
    this._members = this._members.filter(m => m.fingerprint !== member.fingerprint);
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
