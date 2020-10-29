import { Conference, ProgramSession, ProgramSessionEvent, ProgramTrack, TextChat, UserProfile, VideoRoom } from ".";
import { removeNull } from "../../Util";
import * as Schema from "../Schema";
import { PromisesRemapped } from "../WholeSchema";
import { StaticCachedBase, StaticBaseImpl, LocalDataT, CachedBase } from "./Base";

type SchemaT = Schema.Sponsor;
type K = "Sponsor";
const K_str: K = "Sponsor";

export default class Class extends CachedBase<K> implements SchemaT {
    constructor(
        conferenceId: string,
        data: LocalDataT[K],
        parse: Parse.Object<PromisesRemapped<SchemaT>> | null = null) {
        super(conferenceId, K_str, data, parse);
    }

    get colour(): string {
        return this.data.colour;
    }

    set colour(value: string) {
        this.data.colour = value;
    }

    get description(): string | undefined {
        return this.data.description;
    }

    set description(value: string | undefined) {
        this.data.description = value;
    }

    get level(): number {
        return this.data.level;
    }

    set level(value: number) {
        this.data.level = value;
    }

    get logo(): Parse.File | undefined {
        return this.data.logo;
    }

    set logo(value: Parse.File | undefined) {
        this.data.logo = value;
    }

    get name(): string {
        return this.data.name;
    }

    set name(value: string) {
        this.data.name = value;
    }

    get representativeProfileIds(): string[] {
        return this.data.representativeProfileIds;
    }

    set representativeProfileIds(value: string[]) {
        this.data.representativeProfileIds = value;
    }

    get representativeProfiles(): Promise<Array<UserProfile>> {
        return Promise.all(this.data.representativeProfileIds.map(id => UserProfile.get(id, this.conferenceId)) ?? []).then(removeNull);
    }

    get videoRoom(): Promise<VideoRoom | undefined> {
        return this.uniqueRelated("videoRoom");
    }

    get videoRoomId(): string | undefined {
        return this.data.videoRoom;
    }

    set videoRoomId(value: string | undefined) {
        this.data.videoRoom = value;
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
