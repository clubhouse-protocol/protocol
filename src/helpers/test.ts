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

  constructor() {
    this.data = {};
  }

  async get(id: string) {
    return this.data[id];
  }

  async add(id: string, value: string) {
    this.data[id] = value;
  }
}

export {
  createUser,
  createUsers,
  TestTransporter,
  createChannels,
};
