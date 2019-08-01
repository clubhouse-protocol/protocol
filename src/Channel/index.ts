import openpgp, { message as PgpMessage } from 'openpgp';
import Identity, { Message } from 'Identity';
import Transporter from 'Transporter';
import { randomString } from 'helpers/random';
import EventEmitter from 'eventemitter3';
import RuleSet from 'RuleSet';
import rules from 'RuleSet/sets';
import ChannelData from './ChannelData';

interface ChannelPack {
  keys: {
    idKey: string,
    channelKey: string,
  };
  members: string[];
  rules: any,
  ruleSet: string,
}

const rotateKey = (key: string) => `${key}a`; // TODO: hash

const pack = (data: ChannelData): ChannelPack => ({
  keys: data.keys,
  members: data.members.map(m => m.publicKey.armor()),
  rules: data.rules,
  ruleSet: data.ruleSet,
});

class Channel extends EventEmitter {
  private _data: ChannelData;
  private _transporter: Transporter;
  private _ruleEngines: {[name: string]: RuleSet};

  constructor(data: ChannelData, transporter: Transporter) {
    super();
    this._data = data;
    this._transporter = transporter;
    this._ruleEngines = rules;
  }

  get members() {
    return this._data.members;
  }

  async update(): Promise<(Error | Message<any>)[]> {
    const { self, members } = this._data;
    const { idKey, channelKey } = this._data.keys;
    const data = await this._transporter.get(idKey);
    if (!data) {
      return [];
    }
    let output: any;
    try {
      const options = {
        message: await PgpMessage.readArmored(data),
        passwords: [channelKey],
      };
      const outer = await openpgp.decrypt(options);
      const message = await self.decrypt(outer.data as string, members);
      output = message;
      const ruleSet = this._ruleEngines[this._data.ruleSet];
      await ruleSet(message, this._data);
      this.emit('message', message);
    } catch (err) {
      output = err;
      this.emit('messageError', err);
    }
    this._data.keys.idKey = rotateKey(idKey);
    this._data.keys.channelKey = rotateKey(channelKey);
    const next = await this.update();
    return [
      output,
      ...next,
    ];
  }

  async send(data: any, receivers: Identity[] = this._data.members) {
    const { self } = this._data;
    const { idKey, channelKey } = this._data.keys;
    const inner = await self.encrypt(data, receivers);
    const options = {
      message: PgpMessage.fromText(inner),
      passwords: [channelKey],
    };
    const outer = await openpgp.encrypt(options);
    await this._transporter.add(idKey, outer.data);
    return this.update();
  }

  pack(receiver: Identity = this._data.self) {
    const packed = pack(this._data);
    return this._data.self.encrypt(packed, [receiver]);
  }

  static async create(self: Identity, members: string[] = []) {
    const channel = new Channel({
      keys: {
        idKey: randomString(),
        channelKey: randomString(),
      },
      self,
      members: [
        new Identity(self.publicKey),
        ...await Promise.all(members.map(key => Identity.open(key))),
      ],
      rules: {
        dictator: self.fingerprint,
      },
      ruleSet: 'dictatorship',
    }, undefined as any);
    const key = await channel.pack();
    return key;
  }

  static async load(
    self: Identity,
    key: string,
    transporter: Transporter,
    sender: Identity = self,
  ) {
    const channelDataRaw = await self.decrypt<ChannelPack>(key, [sender]);
    const channelData: ChannelData = {
      keys: channelDataRaw.data.keys,
      rules: channelDataRaw.data.rules,
      ruleSet: channelDataRaw.data.ruleSet,
      members: await Promise.all(channelDataRaw.data.members.map(member => Identity.open(member))),
      self,
    };
    const channel = new Channel(channelData, transporter);
    return channel;
  }
}

export default Channel;
