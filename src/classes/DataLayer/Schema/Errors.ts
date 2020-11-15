import { Base } from ".";
import { _User, Conference } from "../Interface";

export default interface Schema extends Base {
    criticality: number;
    errorData: object;
    errorKey: string;

    conference: Promise<Conference | undefined>;
    user: Promise<_User | undefined>;
}
