import { spy } from 'sinon';
import Channel from './index';
import Identity from '../Identity';
import {
  createUsers,
  TestTransporter,
  createChannels,
  sleep,
} from '../helpers/test';
import { DecryptionError } from '../errors';

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
    expect(channel.ruleType).toBe('dictatorship');
    expect(channel.members.all.map(m => m.fingerprint)).toEqual([
      bob.fingerprint,
    ]);
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

  it('should not dispatch update event if no messages', async () => {
    const [bob] = users;
    const [bobChannel] = await createChannels(bob, [], transporter);
    const callback = spy();
    bobChannel.on('updated', callback);
    await bobChannel.update();
    expect(callback.called).toBeFalsy();
  });

  it('should dispatch update event if new messages', async () => {
    const [bob] = users;
    const [bobChannel] = await createChannels(bob, [], transporter);
    const callback = spy();
    bobChannel.on('updated', callback);
    await bobChannel.send('test');
    expect(callback.called).toBeTruthy();
    expect(callback.firstCall.args.length).toBe(2);
    const [messages, responseChannel] = callback.firstCall.args;
    expect(responseChannel).toBe(bobChannel);
    expect(messages.length).toBe(1);
    expect(messages[0].sender.fingerprint).toBe(bob.fingerprint);
    expect(messages[0].data).toBe('test');
  });

  it('should be able to share message', async () => {
    const [bob, alice] = users;
    const [bobChannel, aliceChannel] = await createChannels(bob, [
      alice,
    ], transporter);

    await bobChannel.send('test1');
    await bobChannel.send('test2');
    await bobChannel.send('test3', [bob]);

    const messages = await aliceChannel.update();
    const [msg1, msg2, msg3] = messages;
    expect(msg1).toBeDefined();
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

    if (msg3 instanceof DecryptionError) {
      expect(msg3 instanceof DecryptionError).toBeTruthy();
    }
  });

  it('should be able to listen for signals', async () => {
    const [bob, alice] = users;
    let called = false;
    const [bobChannel] = await createChannels(bob, [
      alice,
    ], transporter);
    await bobChannel.startAutoUpdate(async () => {
      called = true;
    });
    await sleep(10);
    expect(transporter.signalIds.length).toBe(1);
    await transporter.sendSignal(transporter.signalIds[0]);
    await sleep(10);
    expect(called).toBeTruthy();
  });
});
