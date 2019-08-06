import { Message } from '../Identity';
import Rule from '../Channel/Rule';
import Members from '../Channel/Members';

type Validator<RuleType = any> =
  (message: Message<any>, rule: Rule<RuleType>, members: Members) => Promise<void>;

interface RuleSet<RuleType = any> {
  name: string;
  validator: Validator<RuleType>;
}

export {
  Validator,
};

export default RuleSet;
