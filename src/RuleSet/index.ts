import ChannelData from 'Channel/ChannelData';
import { Message } from 'Identity';

type RuleSet<RuleType = any> =
  (message: Message<any>, channel: ChannelData<RuleType>) => Promise<void>;

export default RuleSet;
