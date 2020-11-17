import { Base } from ".";
import { Conference } from "../Interface";

export default interface Schema extends Base {
    connected: boolean;
    participants: Array<string>;

    conference: Promise<Conference>;
}
