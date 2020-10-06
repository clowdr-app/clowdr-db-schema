import * as Schema from "../Schema";
import { StaticCachedBase, StaticBaseImpl, CachedBase, LocalDataT } from "./Base";
import { PrivilegedConferenceDetails, TextChat, _User } from ".";
import { PromisesRemapped } from "../WholeSchema";

type SchemaT = Schema.Conference;
type K = "Conference";
const K_str: K = "Conference";

export default class Class extends CachedBase<K> implements SchemaT {
    constructor(
        conferenceId: string,
        data: LocalDataT[K],
        parse: Parse.Object<PromisesRemapped<SchemaT>> | null = null) {
        super(conferenceId, K_str, data, parse);
    }

    get headerImage(): Parse.File | undefined {
        return this.data.headerImage;
    }

    set headerImage(value) {
        this.data.headerImage = value;
    }

    get welcomeText(): string {
        return this.data.welcomeText;
    }

    set welcomeText(value) {
        this.data.welcomeText = value;
    }

    get name(): string {
        return this.data.name;
    }

    set name(value) {
        this.data.name = value;
    }

    get shortName(): string {
        return this.data.shortName;
    }

    set shortName(value) {
        this.data.shortName = value;
    }

    get lastProgramUpdateTime(): Date {
        return this.data.lastProgramUpdateTime;
    }

    get details(): Promise<Array<PrivilegedConferenceDetails>> {
        return StaticBaseImpl.getAllByField("PrivilegedConferenceDetails", "conference", this.id, this.id);
    }

    get autoWatchTextChats(): Promise<Array<TextChat>> {
        return StaticBaseImpl.getAllByField("TextChat", "autoWatch", true, this.conferenceId);
    }

    static get(id: string): Promise<Class | null> {
        return StaticBaseImpl.get(K_str, id);
    }

    static getAll(): Promise<Array<Class>> {
        return StaticBaseImpl.getAll(K_str);
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
