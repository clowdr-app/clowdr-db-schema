import { Base } from ".";
import { Conference, ContentFeed, ProgramTrack, ProgramPerson } from "../Interface";
import Parse from "parse";

export default interface Schema extends Base {
    abstract: string;
    authors: Array<string> | undefined;
    exhibit: boolean;
    posterImage: Parse.File | undefined;
    title: string;

    conference: Promise<Conference>;
    feed: Promise<ContentFeed | undefined>;
    track: Promise<ProgramTrack>;
}
