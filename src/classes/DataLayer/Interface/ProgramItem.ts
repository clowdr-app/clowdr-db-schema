import * as Schema from "../Schema";
import { CachedBase, StaticCachedBase, StaticBaseImpl, LocalDataT } from "./Base";
import { Conference, ProgramPerson, ProgramTrack, ProgramItemAttachment, ProgramSessionEvent, ContentFeed } from ".";
import { PromisesRemapped } from "../WholeSchema";

type SchemaT = Schema.ProgramItem;
type K = "ProgramItem";
const K_str: K = "ProgramItem";

export default class Class extends CachedBase<K> implements SchemaT {
    constructor(
        conferenceId: string,
        data: LocalDataT[K],
        parse: Parse.Object<PromisesRemapped<SchemaT>> | null = null) {
        super(conferenceId, K_str, data, parse);
    }

    get abstract(): string {
        return this.data.abstract;
    }

    get exhibit(): boolean {
        return this.data.exhibit;
    }

    get posterImage(): Parse.File | undefined {
        return this.data.posterImage;
    }

    get title(): string {
        return this.data.title;
    }

    get authors(): Array<string> {
        return this.data.authors ?? [];
    }
    
    get authorPerons(): Promise<Array<ProgramPerson>> {
        return this.data.authors
            ? Promise.all(this.data.authors.map(async x => {
                const p = await ProgramPerson.get(x, this.conferenceId);
                if (!p) {
                    throw new Error(`Could not get program person ${x}`);
                }
                return p;
            }))
            : Promise.resolve([]);
    }

    get conference(): Promise<Conference> {
        return this.uniqueRelated("conference");
    }

    get track(): Promise<ProgramTrack> {
        return this.uniqueRelated("track");
    }

    get feed(): Promise<ContentFeed | undefined> {
        return this.uniqueRelated("feed").catch(() => undefined);
    }

    get attachments(): Promise<ProgramItemAttachment[]> {
        return StaticBaseImpl.getAllByField("ProgramItemAttachment", "programItem", this.id, this.conferenceId);
    }

    get events(): Promise<ProgramSessionEvent[]> {
        return StaticBaseImpl.getAllByField("ProgramSessionEvent", "item", this.id, this.conferenceId);
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
