import { Base } from ".";
import { Conference, ContentFeed, ProgramItem, ProgramSession } from "../Interface";

export default interface Schema extends Base {
    chair: string | undefined;
    directLink: string | undefined;
    endTime: Date;
    originatingID: string | undefined;
    startTime: Date;

    conference: Promise<Conference>;
    feed: Promise<ContentFeed | undefined>;
    item: Promise<ProgramItem>;
    session: Promise<ProgramSession>;
}
