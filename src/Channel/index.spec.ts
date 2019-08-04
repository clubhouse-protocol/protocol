import Channel from './index';
import Identity from '../Identity';
import { createUsers, TestTransporter } from '../helpers/test';

describe('Channel', () => {
  let users: Identity[];
  let transporter: TestTransporter;

  beforeAll(async () => {
    users = await createUsers(3);
  });

  beforeEach(() => {
    transporter = new TestTransporter();
  });

  it('should be able to create a channel key', async () => {
    const [bob] = users;
    const channelKey = await Channel.create(bob);
    expect(channelKey).toBeDefined();
  });

  it('should be able to load a channel key', async () => {
    const [bob] = users;
    const channelKey = await Channel.create(bob);
    const channel = await Channel.load(bob, channelKey, transporter);
    expect(channel).toBeDefined();
  });

  it('should be able update without messages', async () => {
    const [bob] = users;
    const channelKey = await Channel.create(bob);
    const channel = await Channel.load(bob, channelKey, new TestTransporter());
    await channel.update();
  });

  it('should be able update send a message', async () => {
    const [bob] = users;
    const channelKey = await Channel.create(bob);
    const channel = await Channel.load(bob, channelKey, transporter);
    await channel.send('test');
  });

  it('should be able to get message', async () => {
    const [bob, alice] = users;
    const channelKey = await Channel.create(bob);
    const channel = await Channel.load(bob, channelKey, transporter);
    const [msg1] = await channel.send('test1');
    expect(msg1).toBeDefined();
    expect(msg1 instanceof Error).toBeFalsy();
    if (!(msg1 instanceof Error)) {
      expect(msg1.data).toEqual('test1');
      expect(msg1.sender.fingerprint).toEqual(bob.fingerprint);
    }
    const [msg2] = await channel.send('test2');
    expect(msg2).toBeDefined();
    expect(msg2 instanceof Error).toBeFalsy();
    if (!(msg2 instanceof Error)) {
      expect(msg2.data).toEqual('test2');
      expect(msg2.sender.fingerprint).toEqual(bob.fingerprint);
    }
    const [err] = await channel.send('test2', [alice]);
    expect(err instanceof Error).toBe(true);
  });

  it('should be able to share message', async () => {
    const [bob, alice] = users;
    const bobChannelKey = await Channel.create(bob, [alice.publicKey.armor()]);
    const bobChannel = await Channel.load(bob, bobChannelKey, transporter);
    const aliceChannelKey = await bobChannel.pack(alice);
    const aliceChannel = await Channel.load(alice, aliceChannelKey, transporter, bob);

    await bobChannel.send('test1');
    await bobChannel.send('test2');
    await bobChannel.send('test3', [bob]);

    const messages = await aliceChannel.update();
    const [msg1, msg2, msg3] = messages;
    expect(msg1 instanceof Error).toBeFalsy();
    if (!(msg1 instanceof Error)) {
      expect(msg1.data).toEqual('test1');
      expect(msg1.sender.fingerprint).toEqual(bob.fingerprint);
    }
    expect(msg2).toBeDefined();
    expect(msg2 instanceof Error).toBeFalsy();
    if (!(msg2 instanceof Error)) {
      expect(msg2.data).toEqual('test2');
      expect(msg2.sender.fingerprint).toEqual(bob.fingerprint);
    }

    expect(msg3).toBeDefined();
    expect(msg3 instanceof Error).toBeTruthy();

    if (msg2 instanceof Error) {
      expect(msg3.toString()).toBe('Error decrypting message: Session key decryption failed.');
    }
  });
});
