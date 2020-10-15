import { Base } from ".";
import { Conference, ContentFeed, ProgramTrack } from "../Interface";

export default interface Schema extends Base {
    chair: string | undefined;
    endTime: Date;
    startTime: Date;
    title: string;

    conference: Promise<Conference>;
    feed: Promise<ContentFeed>;
    track: Promise<ProgramTrack>;
}
