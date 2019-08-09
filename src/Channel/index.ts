import EventEmitter from 'eventemitter3';
import openpgp, { message as PgpMessage } from 'openpgp';
import Identity, { Message } from '../Identity';
import Transporter from '../Transporter';
import { randomString } from '../helpers/random';
import RuleSet from '../RuleSet';
import rules from '../RuleSet/sets';
import ChannelData from './ChannelData';
import { hash, hmac } from '../helpers/security';
import Rule from './Rule';
import Members from './Members';

interface ChannelPack {
  keys: {
    idKey: string,
    idKeySeed: string,
    channelKey: string,
  };
  members: string[];
  rules: {
    type: string;
    rules: any;
  },
}

const pack = (data: ChannelData): ChannelPack => ({
  keys: data.keys,
  members: data.members.pack(),
  rules: data.rule.pack(),
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

  get ruleType() {
    return this._data.rule.type;
  }

  startAutoUpdate() {
    Promise.resolve().then(async () => {
      if (this._transporter.waitForSignal) {
        const id = await hash(this._data.keys.idKey);
        await this._transporter.waitForSignal(id);
        await this.update();
        this.startAutoUpdate();
      }
    });
  }

  async update(): Promise<(Error | Message<any> & { id: string })[]> {
    const { self, members } = this._data;
    const { idKey, idKeySeed, channelKey } = this._data.keys;
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
      const message = await self.decrypt(outer.data as string, members.all);
      output = {
        ...message,
        id: idKey,
      };
      const ruleSet = this._ruleEngines[this._data.rule.type];
      await ruleSet.validator(message, this._data.rule, this._data.members);
      this.emit('message', output);
    } catch (err) {
      output = err;
      this.emit('messageError', err);
    }
    this._data.keys.idKey = hmac(idKey, idKeySeed);
    this._data.keys.channelKey = await hash(channelKey);
    const next = await this.update();
    return [
      output,
      ...next,
    ];
  }

  async send(data: any, receivers: Identity[] = this._data.members.all) {
    const preMessages = await this.update();
    const { self } = this._data;
    const { idKey, channelKey } = this._data.keys;
    const inner = await self.encrypt(data, receivers);
    const options = {
      message: PgpMessage.fromText(inner),
      passwords: [channelKey],
    };
    const outer = await openpgp.encrypt(options);
    await this._transporter.add(idKey, outer.data);
    const postMessages = await this.update();
    return [
      ...preMessages,
      ...postMessages,
    ];
  }

  pack(receiver: Identity = this._data.self) {
    const packed = pack(this._data);
    return this._data.self.encrypt(packed, [receiver]);
  }

  static async create(self: Identity, members: string[] = []) {
    const channel = new Channel({
      keys: {
        idKey: randomString(),
        idKeySeed: randomString(),
        channelKey: randomString(),
      },
      self,
      members: new Members([
        new Identity(self.publicKey),
        ...await Promise.all(members.map(key => Identity.open(key))),
      ]),
      rule: new Rule('dictatorship', {
        dictators: [self.fingerprint],
      }),
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
      rule: new Rule(
        channelDataRaw.data.rules.type,
        channelDataRaw.data.rules.rules,
      ),
      members: await Members.create(channelDataRaw.data.members),
      self,
    };
    const channel = new Channel(channelData, transporter);
    return channel;
  }
}

export default Channel;
