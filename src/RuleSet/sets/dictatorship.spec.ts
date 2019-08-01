import Channel from 'Channel';
import Identity from 'Identity';
import { createUsers, TestTransporter } from 'helpers/test';

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
      const bobChannelKey = await Channel.create(bob);
      const bobChannel = await Channel.load(bob, bobChannelKey, transporter);
      expect(bobChannel.members.length).toBe(1);
      const [msg] = await bobChannel.send({
        type: 'ADD_MEMBER',
        key: alice.publicKey.armor(),
      });
      expect(msg instanceof Error).toBeFalsy();
      expect(bobChannel.members.length).toBe(2);
    });

    it('alice should not be able to add members', async () => {
      const [bob, alice, charlie] = users;
      const bobChannelKey = await Channel.create(bob, [alice.publicKey.armor()]);
      const bobChannel = await Channel.load(bob, bobChannelKey, transporter);
      const aliceChannelKey = await bobChannel.pack(alice);
      const aliceChannel = await Channel.load(alice, aliceChannelKey, transporter, bob);
      await aliceChannel.send({
        type: 'ADD_MEMBER',
        key: charlie.publicKey.armor(),
      });
      const [msg1] = await bobChannel.update();
      expect(msg1 instanceof Error).toBeTruthy();
      expect(aliceChannel.members.length).toBe(2);
      expect(bobChannel.members.length).toBe(2);
    });

    it('bob should be able to make alice dictator', async () => {
      const [bob, alice, charlie] = users;
      const bobChannelKey = await Channel.create(bob, [alice.publicKey.armor()]);
      const bobChannel = await Channel.load(bob, bobChannelKey, transporter);
      const aliceChannelKey = await bobChannel.pack(alice);
      const aliceChannel = await Channel.load(alice, aliceChannelKey, transporter, bob);
      await bobChannel.send({
        type: 'CHANGE_RULES',
        rules: {
          dictator: alice.fingerprint,
        },
      });
      await aliceChannel.update();
      await aliceChannel.send({
        type: 'ADD_MEMBER',
        key: charlie.publicKey.armor(),
      });
      const [msg1] = await bobChannel.update();
      expect(msg1 instanceof Error).toBeFalsy();
      expect(aliceChannel.members.length).toBe(3);
      expect(bobChannel.members.length).toBe(3);
    });
  });
});
