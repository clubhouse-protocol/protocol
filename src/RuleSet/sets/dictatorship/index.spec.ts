import Identity from '../../../Identity';
import { createUsers, TestTransporter, createChannels } from '../../../helpers/test';

describe('rules', () => {
  describe('dictatorship', () => {
    let users: Identity[];
    let transporter: TestTransporter;

    beforeAll(async () => {
      users = await createUsers(3);
    });

    beforeEach(() => {
      transporter = new TestTransporter();
    });

    it('bob should be able to add members', async () => {
      const [bob, alice] = users;
      const [bobChannel] = await createChannels(bob, [], transporter);
      expect(bobChannel.members.length).toBe(1);
      const [msg] = await bobChannel.send({
        type: 'ADD_MEMBER',
        key: alice.publicKey.armor(),
      });
      expect(msg instanceof Error).toBeFalsy();
      expect(bobChannel.members.length).toBe(2);
    });

    it('bob should be able to remove members', async () => {
      const [bob, alice] = users;
      const [bobChannel] = await createChannels(bob, [
        alice,
      ], transporter);
      expect(bobChannel.members.length).toBe(2);
      const [msg] = await bobChannel.send({
        type: 'REMOVE_MEMBER',
        key: alice.publicKey.armor(),
      });
      expect(msg instanceof Error).toBeFalsy();
      expect(bobChannel.members.length).toBe(1);
    });

    it('alice should not be able to add members', async () => {
      const [bob, alice, charlie] = users;
      const [bobChannel, aliceChannel] = await createChannels(bob, [
        alice,
      ], transporter);
      await aliceChannel.send({
        type: 'ADD_MEMBER',
        key: charlie.publicKey.armor(),
      });
      const [msg1] = await bobChannel.update();
      expect(msg1 instanceof Error).toBeTruthy();
      expect(aliceChannel.members.length).toBe(2);
      expect(bobChannel.members.length).toBe(2);
    });

    it('alice should be able to remove members', async () => {
      const [bob, alice] = users;
      const [bobChannel, aliceChannel] = await createChannels(bob, [
        alice,
      ], transporter);
      expect(bobChannel.members.length).toBe(2);
      const [msg] = await aliceChannel.send({
        type: 'REMOVE_MEMBER',
        key: alice.publicKey.armor(),
      });
      expect(msg instanceof Error).toBeTruthy();
      expect(bobChannel.members.length).toBe(2);
    });

    it('bob should be able to make alice dictator', async () => {
      const [bob, alice, charlie] = users;
      const [bobChannel, aliceChannel] = await createChannels(bob, [
        alice,
      ], transporter);
      await bobChannel.send({
        type: 'CHANGE_RULES',
        rules: {
          dictators: [alice.fingerprint],
        },
      });
      await aliceChannel.update();
      const [aliceMsg1] = await aliceChannel.send({
        type: 'ADD_MEMBER',
        key: charlie.publicKey.armor(),
      });
      expect(aliceMsg1 instanceof Error).toBeFalsy();
      const [bobMsg1] = await bobChannel.update();
      expect(bobMsg1 instanceof Error).toBeFalsy();
      expect(bobChannel.members.length).toBe(3);
      expect(aliceChannel.members.length).toBe(3);
    });

    it('alice should be able to change rule type', async () => {
      const [bob, alice] = users;
      const [bobChannel, aliceChannel] = await createChannels(bob, [
        alice,
      ], transporter);
      expect(bobChannel.members.length).toBe(2);
      const [msg] = await aliceChannel.send({
        type: 'CHANGE_RULES',
        ruleSet: 'foo',
        rules: {},
      });
      expect(msg instanceof Error).toBeTruthy();
      expect(bobChannel.ruleType).toBe('dictatorship');
    });

    it('bob should be able to change rule type', async () => {
      const [bob, alice] = users;
      const [bobChannel] = await createChannels(bob, [
        alice,
      ], transporter);
      expect(bobChannel.members.length).toBe(2);
      const [msg] = await bobChannel.send({
        type: 'CHANGE_RULES',
        ruleSet: 'foo',
        rules: {},
      });
      expect(msg instanceof Error).toBeFalsy();
      expect(bobChannel.ruleType).toBe('foo');
    });
  });
});
