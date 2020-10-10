import { Base } from ".";
import { Conference, UserProfile } from "../Interface";

export type TextChatModes = "moderation_hub" | "moderation" | "moderation_completed" | "ordinary";

export default interface Schema extends Base {
    autoWatch: boolean;
    isDM: boolean;
    mirrored: boolean;
    mode: TextChatModes;
    name: string;
    relatedModerationKey: string | undefined;
    twilioID: string;

    conference: Promise<Conference>;
    creator: Promise<UserProfile>;
}
