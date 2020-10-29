import { Base } from ".";
import { Conference, VideoRoom } from "../Interface";
import Parse from "parse";

export default interface Schema extends Base {
    colour: string;
    description: string | undefined;
    level: number;
    logo: Parse.File | undefined;
    name: string;
    representativeProfileIds: Array<string>;

    conference: Promise<Conference>;
    videoRoom: Promise<VideoRoom | undefined>;
}
