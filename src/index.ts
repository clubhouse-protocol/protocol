import Identity from 'Identity';
import Channel from 'Channel';
import RuleSet from 'RuleSet';

const loadIdentity = Identity.open;
const createIdentity = Identity.create;

const loadChannel = Channel.load;
const createChannel = Channel.create;

export {
  Channel,
  Identity,
  RuleSet,
  loadIdentity,
  loadChannel,
  createIdentity,
  createChannel,
};
