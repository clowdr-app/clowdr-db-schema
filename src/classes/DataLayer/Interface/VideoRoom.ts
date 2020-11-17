import { Conference, ContentFeed, TextChat, UserProfile, _User } from ".";
import { removeNull } from "../../Util";
import * as Schema from "../Schema";
import { PromisesRemapped } from "../WholeSchema";
import { StaticCachedBase, StaticBaseImpl, LocalDataT, CachedBase } from "./Base";

type SchemaT = Schema.VideoRoom;
type K = "VideoRoom";
const K_str: K = "VideoRoom";

export default class Class extends CachedBase<K> implements SchemaT {
    constructor(
        conferenceId: string,
        data: LocalDataT[K],
        parse: Parse.Object<PromisesRemapped<SchemaT>> | null = null
    ) {
        super(conferenceId, K_str, data, parse);
    }

    get capacity(): number {
        return this.data.capacity;
    }

    get mode(): string | undefined {
        return this.data.mode;
    }

    get ephemeral(): boolean {
        return this.data.ephemeral;
    }

    get isPrivate(): boolean {
        return this.data.isPrivate;
    }

    get name(): string {
        return this.data.name;
    }

    get twilioID(): string | undefined {
        return this.data.twilioID;
    }

    get participants(): Array<string> {
        return this.data.participants;
    }

    get participantProfiles(): Promise<Array<UserProfile>> {
        return Promise.all(this.data.participants.map((id) => UserProfile.get(id, this.conferenceId))).then(removeNull);
    }

    get userIdsWithAccess(): Array<string> {
        return Object.keys(this.data.acl.permissionsById ?? {}).filter((x) => !x.startsWith("role:"));
    }

    get conference(): Promise<Conference> {
        return this.uniqueRelated("conference");
    }

    get textChat(): Promise<TextChat | undefined> {
        return this.uniqueRelated("textChat").catch(() => undefined);
    }

    get textChatId(): string | undefined {
        return this.data.textChat;
    }

    get feeds(): Promise<Array<ContentFeed>> {
        return StaticBaseImpl.getAllByField("ContentFeed", "videoRoom", this.id, this.conferenceId);
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
