import Parse from "parse";
import * as Schema from "../Schema";
import { StaticUncachedBase, StaticBaseImpl, UncachedBase } from "./Base";
import { PromisesRemapped } from "../WholeSchema";

type SchemaT = Schema.Analytics;
type K = "Analytics";
const K_str: K = "Analytics";

export default class Class extends UncachedBase<K> implements SchemaT {
    constructor(parse: Parse.Object<PromisesRemapped<SchemaT>>) {
        super(K_str, parse);
    }

    get conference() {
        return this.uniqueRelated("conference");
    }

    get measurementKey() {
        return this.parse.get("measurementKey");
    }

    get dataKey() {
        return this.parse.get("dataKey");
    }

    get dataValue() {
        return this.parse.get("dataValue");
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
