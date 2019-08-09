import { Validator } from '../..';
import { DisallowedError } from '../../../errors';

interface RuleOptions {
  dictators: string[];
}

/* eslint-disable no-param-reassign */
const dictatorship: Validator<RuleOptions> = async (message, rule, members) => {
  const { data, sender } = message;
  const requireDictator = () => {
    if (!rule.rules.dictators.includes(sender.fingerprint)) {
      throw new DisallowedError('Non-dictator tried to add a user');
    }
  };
  switch (data.type) {
    case 'ADD_MEMBER': {
      requireDictator();
      await members.add(data.key);
      break;
    }
    case 'REMOVE_MEMBER': {
      requireDictator();
      await members.remove(data.key);
      break;
    }
    case 'CHANGE_RULES': {
      requireDictator();
      if (data.ruleSet) {
        rule.changeType(data.ruleSet, data.rules);
      } else {
        rule.rules = data.rules;
      }
      break;
    }
    default:
      break;
  }
};

export default dictatorship;
