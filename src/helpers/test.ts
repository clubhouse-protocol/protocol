import Identity from '../Identity';
import Channel from '../Channel';
import Transporter from '../Transporter';
import { loadChannel } from '..';

const createUser = async () => {
  const key = await Identity.create({
    name: 'bob',
    email: 'bob@example.com',
  });
  return Identity.open(key);
};

const createUsers = (count: number) => {
  const tasks: Promise<Identity>[] = [];
  for (let i = 0; i < count; i += 1) {
    tasks.push(createUser());
  }
  return Promise.all(tasks);
};

const createChannels = async (owner: Identity, members: Identity[], transporter: Transporter) => {
  const ownerKey = await Channel.create(owner, members.map(m => m.publicKey.armor()));
  const ownerChannel = await Channel.load(owner, ownerKey, transporter);
  const memberChannels = await Promise.all(members.map(async (member) => {
    const inivitation = await ownerChannel.pack(member);
    const memberChannel = await loadChannel(member, inivitation, transporter, owner);
    return memberChannel;
  }));

  return [
    ownerChannel,
    ...memberChannels,
  ];
};

class TestTransporter implements Transporter {
  data: {[id: string]: string};
  signals: {[ signal: string]: () => void}

  constructor() {
    this.data = {};
    this.signals = {};
  }

  get signalIds(): string[] {
    return Object.keys(this.signals);
  }

  async get(id: string) {
    return this.data[id];
  }

  async add(id: string, value: string) {
    this.data[id] = value;
  }

  waitForSignal(signal: string) {
    let resolver: () => void = () => {};
    const promise = new Promise<any>((resolve) => {
      resolver = resolve;
    });
    this.signals[signal] = resolver;
    return promise;
  }

  sendSignal(signal: string) {
    this.signals[signal]();
  }
}

const sleep = (ms: number) => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, ms);
});

export {
  createUser,
  createUsers,
  TestTransporter,
  createChannels,
  sleep,
};
