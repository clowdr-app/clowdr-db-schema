import * as Schema from "../Schema";
import { CachedBase, StaticCachedBase, StaticBaseImpl, LocalDataT } from "./Base";
import { Conference, ProgramItem, UserProfile } from ".";
import { PromisesRemapped } from "../WholeSchema";

type SchemaT = Schema.ProgramPerson;
type K = "ProgramPerson";
const K_str: K = "ProgramPerson";

export default class Class extends CachedBase<K> implements SchemaT {
    constructor(
        conferenceId: string,
        data: LocalDataT[K],
        parse: Parse.Object<PromisesRemapped<SchemaT>> | null = null
    ) {
        super(conferenceId, K_str, data, parse);
    }

    get name(): string {
        return this.data.name;
    }

    get affiliation(): string | undefined {
        return this.data.affiliation;
    }

    get email(): string | undefined {
        return this.data.email;
    }

    set email(value) {
        this.data.email = value;
    }

    get items(): Promise<ProgramItem[]> {
        return StaticBaseImpl.getAll<"ProgramItem", ProgramItem>("ProgramItem", this.conferenceId).then((xs) => {
            return xs.filter((x) => x.authors.includes(this.id));
        });
    }

    get conference(): Promise<Conference> {
        return this.uniqueRelated("conference");
    }

    get profile(): Promise<UserProfile | undefined> {
        return this.uniqueRelated("profile").catch(() => undefined);
    }

    get profileId(): string | undefined {
        return this.data.profile;
    }

    set profileId(id: string | undefined) {
        this.data.profile = id;
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
