import { Base } from ".";
import { Conference } from "../Interface";

export default interface Schema extends Base {
    videoId: string;

    conference: Promise<Conference>;
}
