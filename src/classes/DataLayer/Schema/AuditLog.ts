import { Base } from ".";
import { Conference, UserProfile } from "../Interface";

export default interface Schema extends Base {
    action: string;
    data: object;
    target: string;

    actor: Promise<UserProfile>;
    conference: Promise<Conference>;
}
