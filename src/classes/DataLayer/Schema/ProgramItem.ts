import { Base } from ".";
import { Conference, ContentFeed, ProgramPerson, ProgramTrack } from "../Interface";
import Parse from "parse";

export default interface Schema extends Base {
    abstract: string;
    exhibit: boolean;
    posterImage: Parse.File | undefined;
    title: string;

    authors: Promise<Array<ProgramPerson>>;
    conference: Promise<Conference>;
    feed: Promise<ContentFeed | undefined>;
    track: Promise<ProgramTrack>;
}
