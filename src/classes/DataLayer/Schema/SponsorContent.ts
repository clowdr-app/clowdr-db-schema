import { Base } from ".";
import { Conference, Sponsor } from "../Interface";
import Parse from "parse";

export default interface Schema extends Base {
    buttonContents: object | undefined;
    image: Parse.File | undefined;
    markdownContents: string | undefined;
    ordering: number;
    videoURL: string | undefined;
    wide: boolean;

    conference: Promise<Conference>;
    sponsor: Promise<Sponsor>;
}
