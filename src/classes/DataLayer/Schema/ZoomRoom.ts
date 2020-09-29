import { Base } from ".";
import { Conference } from "../Interface";

export default interface Schema extends Base {
    url: string;

    conference: Promise<Conference>;
}
