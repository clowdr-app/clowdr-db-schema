import { Conference } from ".";
import * as Schema from "../Schema";
import { PromisesRemapped } from "../WholeSchema";
import { StaticUncachedBase, StaticBaseImpl, UncachedBase } from "./Base";

type SchemaT = Schema.Registration;
type K = "Registration";
const K_str: K = "Registration";

export default class Class extends UncachedBase<K> implements SchemaT {
    constructor(parse: Parse.Object<PromisesRemapped<SchemaT>>) {
        super(K_str, parse);
    }

    get affiliation(): string | undefined {
        return this.parse.get("affiliation");
    }

    set affiliation(value) {
        this.parse.set("affiliation", value);
    }

    get country(): string | undefined {
        return this.parse.get("country");
    }

    set country(value) {
        this.parse.set("country", value);
    }

    get email(): string {
        return this.parse.get("email");
    }

    set email(value) {
        this.parse.set("email", value);
    }
    
    get newRole(): string {
        return this.parse.get("newRole");
    }

    set newRole(value) {
        this.parse.set("newRole", value);
    }

    get invitationSentDate(): Date | undefined {
        return this.parse.get("invitationSentDate");
    }

    get name(): string {
        return this.parse.get("name");
    }

    set name(value) {
        this.parse.set("name", value);
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
