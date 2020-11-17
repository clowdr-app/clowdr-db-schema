import { Base } from ".";
import { Conference, TextChat } from "../Interface";

export default interface Schema extends Base {
    capacity: number;
    ephemeral: boolean;
    isPrivate: boolean;
    mode: string | undefined;
    name: string;
    participants: Array<string>;
    twilioID: string | undefined;

    conference: Promise<Conference>;
    textChat: Promise<TextChat | undefined>;
}
