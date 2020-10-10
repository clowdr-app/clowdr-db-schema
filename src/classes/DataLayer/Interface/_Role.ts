import Parse from "parse";
import * as Schema from "../Schema";
import { StaticUncachedBase, StaticBaseImpl, UncachedBase } from "./Base";
import { PromisesRemapped } from "../WholeSchema";
import { Conference, _User } from ".";
import { RoleNames } from "../Schema/_Role";

type SchemaT = Schema._Role;
type K = "_Role";
const K_str: K = "_Role";

export default class Class extends UncachedBase<K> implements SchemaT {
    constructor(parse: Parse.Object<PromisesRemapped<SchemaT>>) {
        super(K_str, parse);
    }

    get name(): string {
        return this.parse.get("name");
    }

    get users(): Promise<_User[]> {
        return this.nonUniqueRelated("users");
    }

    get roles(): Promise<Class[]> {
        return this.nonUniqueRelated("roles");
    }

    get conference(): Promise<Conference> {
        return this.uniqueRelated("conference");
    }

    private static generateRoleName(confId: string, roleName: RoleNames) {
        return confId + "-" + roleName;
    }

    /**
     * If the current user is attendee/manager, only apply this function to the
     * current user.
     * 
     * `_User` table is protected by ACLs, so attendees cannot access all the
     * values of user-related fields. This means the `users` of `_Role.users`
     * will only return the current user or none at all (not every other user in
     * the role).
     */
    static async isUserInRoles(userId: string, conferenceId: string, roles: Array<RoleNames>): Promise<boolean> {
        const q = new Parse.Query<Parse.Object<PromisesRemapped<SchemaT>>>(K_str);
        q.equalTo("conference", { __type: "Pointer", className: "Conference", objectId: conferenceId });
        q.equalTo("users", { __type: "Pointer", className: "_User", objectId: userId });
        const expectedRoleNames = roles.map(r => Class.generateRoleName(conferenceId, r));
        return (await q.map(role => {
            const cRoleName = role.get("name");
            return expectedRoleNames.includes(cRoleName);
        })).some(x => !!x);
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
