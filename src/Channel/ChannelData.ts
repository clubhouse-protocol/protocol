import Identity from '../Identity';
import Rule from './Rule';
import Members from './Members';

interface ChannelData<RuleType = any> {
  self: Identity;
  members: Members;
  keys: {
    idKey: string,
    idKeySeed: string,
    channelKey: string,
  },
  rule: Rule<RuleType>,
}

export default ChannelData;
