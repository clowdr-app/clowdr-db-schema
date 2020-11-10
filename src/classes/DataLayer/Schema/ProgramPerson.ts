import { Base } from ".";
import { Conference, UserProfile } from "../Interface";

export default interface Schema extends Base {
    affiliation: string | undefined;
    email: string | undefined;
    name: string;

    conference: Promise<Conference>;
    profile: Promise<UserProfile | undefined>;
}
