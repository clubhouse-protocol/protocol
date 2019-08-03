import RuleSet from '..';
import Identity from '../../Identity';

interface RuleType {
  dictator: string;
}

/* eslint-disable no-param-reassign */
const dictatorship: RuleSet<RuleType> = async (message, channel) => {
  const { data, sender } = message;
  const requireDictator = () => {
    if (sender.fingerprint !== channel.rules.dictator) {
      throw new Error('Non-dictator tried to add a user');
    }
  };
  switch (data.type) {
    case 'ADD_MEMBER': {
      requireDictator();
      const identity = await Identity.open(data.key);
      channel.members.push(identity);
      break;
    }
    case 'CHANGE_RULES': {
      requireDictator();
      channel.ruleSet = data.ruleSet || channel.ruleSet;
      channel.rules = data.rules;
      break;
    }
    default:
      break;
  }
};

export default dictatorship;
