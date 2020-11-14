import { Conference, UserProfile, VideoRoom } from ".";
import * as Schema from "../Schema";
import { TextChatModes } from "../Schema/TextChat";
import { PromisesRemapped } from "../WholeSchema";
import { StaticCachedBase, StaticBaseImpl, LocalDataT, CachedBase } from "./Base";

type SchemaT = Schema.TextChat;
type K = "TextChat";
const K_str: K = "TextChat";

export default class Class extends CachedBase<K> implements SchemaT {
    constructor(
        conferenceId: string,
        data: LocalDataT[K],
        parse: Parse.Object<PromisesRemapped<SchemaT>> | null = null
    ) {
        super(conferenceId, K_str, data, parse);
    }

    get autoWatch(): boolean {
        return this.data.autoWatch;
    }

    set autoWatch(value) {
        this.data.autoWatch = value;
    }

    get mirrored(): boolean {
        return this.data.mirrored;
    }

    get isDM(): boolean {
        return this.data.isDM;
    }

    get name(): string {
        return this.data.name;
    }

    get mode(): TextChatModes {
        return this.data.mode;
    }

    set mode(value) {
        this.data.mode = value;
    }

    get relatedModerationKey(): string | undefined {
        return this.data.relatedModerationKey;
    }

    get twilioID(): string {
        return this.data.twilioID;
    }

    get creator(): Promise<UserProfile> {
        return this.uniqueRelated("creator");
    }

    get conference(): Promise<Conference> {
        return this.uniqueRelated("conference");
    }

    get videoRooms(): Promise<Array<VideoRoom>> {
        return StaticBaseImpl.getAllByField("VideoRoom", "textChat", this.id, this.conferenceId);
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
