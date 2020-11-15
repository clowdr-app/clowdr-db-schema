import { Base } from ".";
import { Conference } from "../Interface";

export default interface Schema extends Base {
    dataKey: string;
    dataValue: object;
    measurementKey: string;

    conference: Promise<Conference | undefined>;
}
