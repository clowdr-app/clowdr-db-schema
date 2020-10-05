import { Base } from ".";
import { Conference } from "../Interface";

export default interface Schema extends Base {
    affiliation: string | undefined;
    country: string | undefined;
    email: string;
    invitationSentDate: Date | undefined;
    name: string;
    newRole: string;

    conference: Promise<Conference>;
}
