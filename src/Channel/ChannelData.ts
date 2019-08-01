import Identity from 'Identity';

interface ChannelData<RuleType = any> {
  self: Identity;
  members: Identity[];
  keys: {
    idKey: string,
    channelKey: string,
  },
  rules: RuleType,
  ruleSet: string,
}

export default ChannelData;
