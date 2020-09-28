import { Base } from ".";
import { Conference, TextChat } from "../Interface";

export default interface Schema extends Base {
    capacity: number;
    ephemeral: boolean;
    name: string;
    twilioID: string;

    conference: Promise<Conference>;
    textChat: Promise<TextChat | undefined>;
}
