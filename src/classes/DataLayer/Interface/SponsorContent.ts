import { Conference, ProgramSession, ProgramSessionEvent, ProgramTrack, Sponsor, TextChat, UserProfile, VideoRoom } from ".";
import { removeNull } from "../../Util";
import * as Schema from "../Schema";
import { PromisesRemapped } from "../WholeSchema";
import { StaticCachedBase, StaticBaseImpl, LocalDataT, CachedBase } from "./Base";

type SchemaT = Schema.SponsorContent;
type K = "SponsorContent";
const K_str: K = "SponsorContent";

export default class Class extends CachedBase<K> implements SchemaT {
    constructor(
        conferenceId: string,
        data: LocalDataT[K],
        parse: Parse.Object<PromisesRemapped<SchemaT>> | null = null) {
        super(conferenceId, K_str, data, parse);
    }

    get buttonContents(): any {
        return this.data.buttonContents;
    }

    set buttonContents(value: any) {
        this.data.buttonContents = value;
    }

    get image(): Parse.File | undefined {
        return this.data.image;
    }

    set image(value: Parse.File | undefined) {
        this.data.image = value;
    }

    get markdownContents(): string | undefined {
        return this.data.markdownContents;
    }

    set markdownContents(value: string | undefined) {
        this.data.markdownContents = value;
    }

    get ordering(): number {
        return this.data.ordering;
    }

    set ordering(value: number) {
        this.data.ordering = value;
    }

    get videoURL(): string | undefined {
        return this.data.videoURL;
    }

    set videoURL(value: string | undefined) {
        this.data.videoURL = value;
    }

    get wide(): boolean {
        return this.data.wide;
    }

    set wide(value: boolean) {
        this.data.wide = value;
    }

    get sponsor(): Promise<Sponsor> {
        return this.uniqueRelated("sponsor");
    }

    set sponsorId(value: string) {
        this.data.sponsor = value;
    }


    get conference(): Promise<Conference> {
        return this.uniqueRelated("conference");
    }

    static get(id: string, conferenceId: string): Promise<Class | null> {
        return StaticBaseImpl.get(K_str, id, conferenceId);
    }

    static getAll(conferenceId: string): Promise<Array<Class>> {
        return StaticBaseImpl.getAll(K_str, conferenceId);
    }

    static onDataUpdated(conferenceId: string) {
        return StaticBaseImpl.onDataUpdated(K_str, conferenceId);
    }

    static onDataDeleted(conferenceId: string) {
        return StaticBaseImpl.onDataDeleted(K_str, conferenceId);
    }
}

// The line of code below triggers type-checking of Class for static members
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _: StaticCachedBase<K> = Class;
