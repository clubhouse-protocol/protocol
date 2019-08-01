import { ChannelData } from "Channel";
import { Message } from "Identity";

type RuleSet<RuleType = any> = (message: Message<any>, channel: ChannelData<RuleType>) => Promise<void>;

export default RuleSet