import { Base } from ".";
import { Conference, ContentFeed, ProgramItem, ProgramSession } from "../Interface";

export default interface Schema extends Base {
    directLink: string | undefined;
    endTime: Date;
    startTime: Date;

    conference: Promise<Conference>;
    feed: Promise<ContentFeed | undefined>;
    item: Promise<ProgramItem>;
    session: Promise<ProgramSession>;
}
