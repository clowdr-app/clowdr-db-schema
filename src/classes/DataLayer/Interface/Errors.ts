import Parse from "parse";
import * as Schema from "../Schema";
import { StaticUncachedBase, StaticBaseImpl, UncachedBase } from "./Base";
import { PromisesRemapped } from "../WholeSchema";

type SchemaT = Schema.Errors;
type K = "Errors";
const K_str: K = "Errors";

export default class Class extends UncachedBase<K> implements SchemaT {
    constructor(parse: Parse.Object<PromisesRemapped<SchemaT>>) {
        super(K_str, parse);
    }

    get conference() {
        return this.uniqueRelated("conference");
    }

    get user() {
        return this.uniqueRelated("user");
    }

    get criticality() {
        return this.parse.get("criticality");
    }

    get errorKey() {
        return this.parse.get("errorKey");
    }

    get errorData(): any {
        return this.parse.get("errorData");
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
