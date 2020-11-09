import * as Schema from "../Schema";
import { CachedBase, StaticCachedBase, StaticBaseImpl, LocalDataT } from "./Base";
import { ProgramItem, AttachmentType, Conference } from ".";
import { PromisesRemapped } from "../WholeSchema";

type SchemaT = Schema.ProgramItemAttachment;
type K = "ProgramItemAttachment";
const K_str: K = "ProgramItemAttachment";

export default class Class extends CachedBase<K> implements SchemaT {
    constructor(
        conferenceId: string,
        data: LocalDataT[K],
        parse: Parse.Object<PromisesRemapped<SchemaT>> | null = null
    ) {
        super(conferenceId, K_str, data, parse);
    }

    get file(): Parse.File | undefined {
        return this.data.file;
    }

    set file(value) {
        this.data.file = value;
    }

    get url(): string | undefined {
        return this.data.url;
    }

    get programItem(): Promise<ProgramItem> {
        return this.uniqueRelated("programItem");
    }

    get programItemId(): string {
        return this.data.programItem;
    }

    get conference(): Promise<Conference> {
        return this.uniqueRelated("conference");
    }

    get attachmentType(): Promise<AttachmentType> {
        return this.uniqueRelated("attachmentType");
    }

    get attachmentTypeId(): string {
        return this.data.attachmentType;
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
