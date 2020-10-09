import { Base } from ".";
import { Conference, UserProfile } from "../Interface";

export default interface Schema extends Base {
    autoWatch: boolean;
    isDM: boolean;
    mirrored: boolean;
    mode: string;
    name: string;
    relatedModerationKey: string | undefined;
    twilioID: string;

    conference: Promise<Conference>;
    creator: Promise<UserProfile>;
}
