import { Base } from ".";
import { Conference, ContentFeed } from "../Interface";

export default interface Schema extends Base {
    colour: string;
    name: string;
    shortName: string;

    conference: Promise<Conference>;
    feed: Promise<ContentFeed | undefined>;
}
