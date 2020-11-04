import { Base } from ".";
import { Conference, ContentFeed, ProgramTrack } from "../Interface";

export default interface Schema extends Base {
    chair: string | undefined;
    originatingID: string | undefined;
    title: string;

    conference: Promise<Conference>;
    feed: Promise<ContentFeed>;
    track: Promise<ProgramTrack>;
}
