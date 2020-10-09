import Parse from "parse";
import * as Schema from "../Schema";
import { StaticUncachedBase, StaticBaseImpl, UncachedBase } from "./Base";
import { PromisesRemapped } from "../WholeSchema";
import { Conference, UserProfile, _User } from ".";

type SchemaT = Schema.AuditLog;
type K = "AuditLog";
const K_str: K = "AuditLog";

export default class Class extends UncachedBase<K> implements SchemaT {
    constructor(parse: Parse.Object<PromisesRemapped<SchemaT>>) {
        super(K_str, parse);
    }

    get action(): string {
        return this.parse.get("action");
    }

    get data(): any {
        return this.parse.get("data");
    }

    get target(): string {
        return this.parse.get("target");
    }

    get actor(): Promise<UserProfile> {
        return this.uniqueRelated("actor");
    }

    get conference(): Promise<Conference> {
        return this.uniqueRelated("conference");
    }

    static get(id: string, conferenceId?: string): Promise<Class | null> {
        return StaticBaseImpl.get(K_str, id, conferenceId);
    }

    static getAll(conferenceId?: string): Promise<Array<Class>> {
        return StaticBaseImpl.getAll(K_str, conferenceId);
    }
}

// The line of code below triggers type-checking of Class for static members
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _: StaticUncachedBase<K> = Class;
