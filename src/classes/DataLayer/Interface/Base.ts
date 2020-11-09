import { keys } from "ts-transformer-keys";

import Parse from "parse";
import CachedSchema from "../CachedSchema";
import { PromisedKeys, KnownKeys } from "../../Util";
import * as Schema from "../Schema";
import Caches, { Cache } from "../Cache";
import UncachedSchema from "../UncachedSchema";
import { CachedSchemaKeys, IBase, PromisesRemapped, RelationsToTableNames, UncachedSchemaKeys, WholeSchema, WholeSchemaKeys } from "../WholeSchema";
import { ISimpleEvent } from "strongly-typed-events";
import { DataDeletedEventDetails, DataUpdatedEventDetails } from "../Cache/Cache";
import { ACLSchema } from "../Schema/Base";
import assert from "assert";

/*
 * 2020-09-09 A note to future developers on constructors
 *
 * At the time of writing, TypeScript fails to enforce type checking for the
 * kind of `new` on an interface when defined in the slightly weird style that
 * this data layer uses. It is unknown to me (Ed) why this is the case, since
 * all other type checking (that the data layer currently relies upon) appears
 * to work just fine. At any rate, some care must be taken to ensure the
 * constructor types (arguments and return type) all mactch up in: StaticBase,
 * Constructor, and Base.
 */


export const CachedStoreNames = keys<CachedSchema>() as Array<CachedSchemaKeys>;

export type RelatedDataT
    = {
        [K in CachedSchemaKeys]: {
            [K2 in PromisedKeys<CachedSchema[K]["value"]>]: CachedSchema[K]["value"][K2] extends Promise<infer Q> ? Q : never
        }
    } & {
        [K in UncachedSchemaKeys]: {
            [K2 in PromisedKeys<UncachedSchema[K]["value"]>]: UncachedSchema[K]["value"][K2] extends Promise<infer Q> ? Q : never
        }
    };

export type LocalDataT
    = {
        [K in CachedSchemaKeys]: {
            [K2 in KnownKeys<CachedSchema[K]["value"]>]:
            CachedSchema[K]["value"][K2] extends Promise<Array<IBase<infer Z>>> ? Array<string> :
            CachedSchema[K]["value"][K2] extends Promise<IBase<infer Z>> ? string :
            CachedSchema[K]["value"][K2] extends Promise<IBase<infer Z> | undefined> ? string | undefined :
            CachedSchema[K]["value"][K2]
        } & {
            [K in KnownKeys<Schema.Base>]: Schema.Base[K]
        }
    } & {
        [K in UncachedSchemaKeys]: {
            [K2 in KnownKeys<UncachedSchema[K]["value"]>]:
            UncachedSchema[K]["value"][K2] extends Promise<Array<IBase<infer Z>>> ? Array<string> :
            UncachedSchema[K]["value"][K2] extends Promise<IBase<infer Z>> ? string :
            UncachedSchema[K]["value"][K2] extends Promise<IBase<infer Z> | undefined> ? string | undefined :
            UncachedSchema[K]["value"][K2]
        } & {
            [K in KnownKeys<Schema.Base>]: Schema.Base[K]
        }
    };

export interface StaticCachedBase<K extends CachedSchemaKeys> {
    // Must match the type of `CachedConstructor` below
    new(conferenceId: string,
        data: LocalDataT[K],
        parse?: Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>> | null): IBase<K>;

    get(id: string, conferenceId: string): Promise<IBase<K> | null>;
    getAll(conferenceId: string): Promise<Array<IBase<K>>>;

    onDataUpdated(conferenceId: string): Promise<ISimpleEvent<DataUpdatedEventDetails<K>>>;
    onDataDeleted(conferenceId: string): Promise<ISimpleEvent<DataDeletedEventDetails<K>>>;
}

export type CachedConstructor<K extends CachedSchemaKeys>
    = new (
        conferenceId: string,
        data: LocalDataT[K],
        parse?: Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>> | null) => IBase<K>;

export type UncachedConstructor<K extends UncachedSchemaKeys>
    = new (parse: Parse.Object<PromisesRemapped<UncachedSchema[K]["value"]>>) => IBase<K>;

export type Constructor<K extends WholeSchemaKeys>
    = K extends CachedSchemaKeys ? CachedConstructor<K>
    : K extends UncachedSchemaKeys ? UncachedConstructor<K>
    : never;

export interface StaticUncachedBase<K extends UncachedSchemaKeys> {
    // Must match the type of `UncachedConstructor` below
    new(parse: Parse.Object<PromisesRemapped<UncachedSchema[K]["value"]>>): IBase<K>;

    get(id: string): Promise<IBase<K> | null>;
    getAll(): Promise<Array<IBase<K>>>;
}

/**
 * Provides a vanilla reusable implementation of the static base methods.
 */
export abstract class StaticBaseImpl {
    private static IsCachable(
        tableName: WholeSchemaKeys,
        conferenceId?: string
    ): conferenceId is string {
        return CachedStoreNames.includes(tableName as any) && !!conferenceId;
    }

    static async wrapItem<K extends WholeSchemaKeys, T extends IBase<K>>(
        tableName: K,
        parse: Parse.Object<PromisesRemapped<WholeSchema[K]["value"]>>
    ): Promise<T> {
        if (CachedStoreNames.includes(tableName as CachedSchemaKeys)) {
            const _parse = parse as Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>>;
            let conferenceId;
            if (tableName === "Conference") {
                conferenceId = _parse.id;
            }
            else {
                conferenceId = _parse.get("conference" as any).id as string;
            }
            let _tableName = tableName as CachedSchemaKeys;
            let cache = await Caches.get(conferenceId);
            return cache.addItemToCache(_parse as any, _tableName, false) as unknown as T;
        }
        else {
            const constr = Cache.Constructors[tableName as UncachedSchemaKeys] as UncachedConstructor<any>;
            const _parse = parse as Parse.Object<PromisesRemapped<UncachedSchema[K]["value"]>>;
            return new constr(_parse) as T;
        }
    }

    static async get<K extends WholeSchemaKeys, T extends IBase<K>>(
        tableName: K,
        id: string,
        conferenceId?: string,
    ): Promise<T | null> {
        // Yes these casts are safe
        if (StaticBaseImpl.IsCachable(tableName, conferenceId) || tableName === "Conference") {
            let _tableName = tableName as CachedSchemaKeys;
            let cache = await Caches.get(conferenceId ? conferenceId : id);
            return cache.get(_tableName, id) as unknown as T;
        }
        else {
            let query = new Parse.Query<Parse.Object<PromisesRemapped<WholeSchema[K]["value"]>>>(tableName);
            return await query.get(id).then(async parse => {
                return StaticBaseImpl.wrapItem<K, T>(tableName, parse);
            }).catch(reason => {
                console.warn("Fetch from database of uncached item failed", {
                    tableName: tableName,
                    id: id,
                    reason: reason
                });

                return null;
            });
        }
    }

    static async getByField<
        K extends WholeSchemaKeys,
        S extends KnownKeys<LocalDataT[K]>,
        T extends IBase<K>
    >(
        tableName: K,
        fieldName: S,
        searchFor: LocalDataT[K][S],
        conferenceId?: string,
        trustCache: boolean = true
    ): Promise<T | null> {
        let result: T | null = null;
        if (StaticBaseImpl.IsCachable(tableName, conferenceId)) {
            const _tableName = tableName as CachedSchemaKeys;
            const cache = await Caches.get(conferenceId);
            if (cache.IsInitialised && cache.IsUserAuthenticated) {
                result = await cache.getByField(_tableName, fieldName as any, searchFor) as unknown as T;
            }
            else {
                trustCache = false;
            }
        }
        else {
            trustCache = false;
        }

        if (!result && !trustCache) {
            let query = new Parse.Query<Parse.Object<PromisesRemapped<WholeSchema[K]["value"]>>>(tableName);
            if (fieldName in RelationsToTableNames[tableName]) {
                if (searchFor instanceof Array) {
                    let _searchFor: Array<string> = searchFor;
                    query.containedIn(fieldName as any, _searchFor.map(x => {
                        return new Parse.Object(RelationsToTableNames[tableName][fieldName as any], {
                            id: x
                        }) as any;
                    }));
                }
                else {
                    query.equalTo(fieldName as any, new Parse.Object(RelationsToTableNames[tableName][fieldName as any], {
                        id: searchFor
                    }) as any);
                }
            }
            else {
                query.equalTo(fieldName as any, searchFor as any);
            }
            if (conferenceId) {
                query.equalTo("conference" as any, new Parse.Object("Conference", { id: conferenceId }) as any);
            }

            let itemP = query.first();
            return itemP.then(async parse => {
                if (parse) {
                    return StaticBaseImpl.wrapItem<K, T>(tableName, parse);
                }
                return null;
            }).catch(reason => {
                console.warn("Fetch by field from database failed", {
                    tableName: tableName,
                    fieldName: fieldName,
                    searchFor: searchFor,
                    reason: reason
                });

                return null;
            });
        }
        else {
            return result;
        }
    }

    static async getAll<K extends WholeSchemaKeys, T extends IBase<K>>(
        tableName: K,
        conferenceId?: string): Promise<Array<T>> {
        // Conference is a special-case table
        if (StaticBaseImpl.IsCachable(tableName, conferenceId) && tableName !== "Conference") {
            let cache = await Caches.get(conferenceId);
            return cache.getAll(tableName as any) as any;
        }
        else {
            let query = new Parse.Query<Parse.Object<PromisesRemapped<WholeSchema[K]["value"]>>>(tableName);
            return query.map(async parse => {
                return StaticBaseImpl.wrapItem<K, T>(tableName, parse);
            }).catch(reason => {
                return Promise.reject(`Fetch all from database of uncached table failed\n${reason}`);
            });
        }
    }

    static async getAllByField<
        K extends WholeSchemaKeys,
        S extends KnownKeys<LocalDataT[K]>,
        T extends IBase<K>
    >(
        tableName: K,
        fieldName: S,
        searchFor: LocalDataT[K][S],
        conferenceId?: string,
        trustCache: boolean = true
    ): Promise<Array<T>> {
        let results: Array<T> = [];
        if (StaticBaseImpl.IsCachable(tableName, conferenceId)) {
            const _tableName = tableName as CachedSchemaKeys;
            const cache = await Caches.get(conferenceId);
            if (cache.IsInitialised && cache.IsUserAuthenticated) {
                results = await cache.getAllByField(_tableName, fieldName as any, searchFor) as unknown as T[];
            }
            else {
                trustCache = false;
            }
        }
        else {
            trustCache = false;
        }

        if (results.length === 0 && !trustCache) {
            let query = new Parse.Query<Parse.Object<PromisesRemapped<WholeSchema[K]["value"]>>>(tableName);
            if (fieldName in RelationsToTableNames[tableName]) {
                if (searchFor instanceof Array) {
                    // TODO: Test this - really, test this, and if it doesn't work - fix it in getByField too

                    let _searchFor: Array<string> = searchFor;
                    query.containedIn(fieldName as any, _searchFor.map(x => {
                        return new Parse.Object(RelationsToTableNames[tableName][fieldName as any], {
                            id: x
                        }) as any;
                    }));
                }
                else {
                    query.equalTo(fieldName as any, new Parse.Object(RelationsToTableNames[tableName][fieldName as any], {
                        id: searchFor
                    }) as any);
                }
            }
            else {
                query.equalTo(fieldName as any, searchFor as any);
            }
            if (conferenceId) {
                query.equalTo("conference" as any, new Parse.Object("Conference", { id: conferenceId }) as any);
            }

            return await query.map(async parse => {
                return StaticBaseImpl.wrapItem<K, T>(tableName, parse);
            }).catch(reason => {
                console.warn("Fetch by field from database failed", {
                    tableName: tableName,
                    fieldName: fieldName,
                    searchFor: searchFor,
                    reason: reason
                });

                return [];
            });
        }
        else {
            return results;
        }
    }

    static async onDataUpdated<K extends CachedSchemaKeys>(
        tableName: K,
        conferenceId: string
    ): Promise<ISimpleEvent<DataUpdatedEventDetails<K>>> {
        let cache = await Caches.get(conferenceId);
        return cache.onDataUpdated<K>(tableName);
    }

    static async onDataDeleted<K extends CachedSchemaKeys>(
        tableName: K,
        conferenceId: string
    ): Promise<ISimpleEvent<DataDeletedEventDetails<K>>> {
        let cache = await Caches.get(conferenceId);
        return cache.onDataDeleted<K>(tableName);
    }

}

/**
 * Provides the methods and properties common to all data objects (e.g. `id`).
 */
export abstract class CachedBase<K extends CachedSchemaKeys> implements IBase<K> {
    constructor(
        public readonly conferenceId: string,
        protected tableName: K,
        protected data: LocalDataT[K],
        protected parse: Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>> | null = null) {
    }

    /**
     * DO NOT USE THIS without consulting the lead development team! This
     * function is not recommended for use! This bypasses the cache!
     * 
     * This function exists only for scenarios where high-performance database
     * queries are required, such as complex lookups that the cache cannot
     * handle.
     * 
     * @deprecated Do not use - see doc comment.
     */
    async getUncachedParseObject(): Promise<Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>>> {
        if (this.parse) {
            return this.parse;
        }
        else {
            let query = new Parse.Query<Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>>>(this.tableName);
            query.includeAll();
            return query.get(this.id);
        }
    }

    get id(): string {
        return this.data.id;
    }

    get createdAt(): Date {
        return this.data.createdAt;
    }

    get updatedAt(): Date {
        return this.data.updatedAt;
    }

    get acl(): ACLSchema {
        return this.data.acl;
    }

    async save(): Promise<void> {
        if (!this.parse) {
            // @ts-ignore
            let parseData: PromisesRemapped<CachedSchema[K]["value"]> = {
                id: this.id
            };
            this.parse = new Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>>(this.tableName, parseData);
        }
        
        for (let _key of Cache.Fields[this.tableName]) {
            let key = _key as KnownKeys<LocalDataT[K]>;
            if (key !== "id" && key !== "acl") {
                // Yes these casts are safe

                let rels = Cache.Relations[this.tableName] as Array<string>;
                if (rels.includes(key as string)) {
                    let uniqRels = Cache.UniqueRelations[this.tableName] as Array<string>;
                    if (uniqRels.includes(key as string)) {
                        let targetId = this.data[key] as unknown as string;
                        if (targetId) {
                            this.parse.set(key as any, new Parse.Object(RelationsToTableNames[this.tableName][key as any], { id: targetId }) as any);
                        }
                        else {
                            this.parse.unset(key as any);
                        }
                    }
                    else {
                        let r = this.parse.relation(key as any);
                        await r.query().map(x => {
                            r.remove(x);
                        });

                        let ids = this.data[key] as string[];
                        if (ids) {
                            for (let targetId of ids) {
                                if (targetId) {
                                    r.add(new Parse.Object(RelationsToTableNames[this.tableName][key as any], { id: targetId }));
                                }
                            }
                        }
                    }
                }
                else {
                    // Is it a Parse.File...
                    if (this.data[key] && typeof this.data[key] === "object" && "_name" in this.data[key] && "_url" in this.data[key]) {
                        // If so, the `parse` object will already contain a "proper" instance of Parse.File
                        // that we should only overwrite with a newer "proper" instance
                        // So...is this a proper instance? If the data came from the cache, _source will be `undefined`
                        // but if it's a proper new Parse.File, _source will exist.
                        if ("_source" in this.data[key] && this.data[key]["_source"]) {
                            this.parse.set(key as any, this.data[key]);
                        }
                    }
                    else if (this.data[key] !== undefined) {
                        this.parse.set(key as any, this.data[key]);
                    } else {
                        this.parse.unset(key as any);
                    }
                }
            }
            else if (key === "acl") {
                const newACL = new Parse.ACL();
                const perms = this.data.acl.permissionsById;
                const permKeys = Object.keys(this.data.acl.permissionsById);
                for (const permKey of permKeys) {
                    const perm = perms[permKey];
                    if (perm.read) {
                        if (permKey === "*") {
                            newACL.setPublicReadAccess(true);
                        }
                        else if (permKey.startsWith("role:")) {
                            newACL.setRoleReadAccess(permKey.substr(5), true);
                        }
                        else {
                            newACL.setReadAccess(permKey, true);
                        }
                    }
                    if (perm.write) {
                        if (permKey === "*") {
                            newACL.setPublicWriteAccess(true);
                        }
                        else if (permKey.startsWith("role:")) {
                            newACL.setRoleWriteAccess(permKey.substr(5), true);
                        }
                        else {
                            newACL.setWriteAccess(permKey, true);
                        }
                    }
                }
                this.parse.setACL(newACL);
            }
        }

        await this.parse.save();
    }

    async delete(): Promise<void> {
        if (!this.parse) {
            // @ts-ignore
            let parseData: PromisesRemapped<CachedSchema[K]["value"]> = {
                id: this.id
            };
            this.parse = new Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>>(this.tableName, parseData);
        }
        await this.parse.destroy();
    }

    protected async uniqueRelated<S extends KnownKeys<RelatedDataT[K]>>(field: S): Promise<RelatedDataT[K][S]> {
        let cache = await Caches.get(this.conferenceId);
        let r2t: Record<string, string> = RelationsToTableNames[this.tableName];
        let targetTableName = r2t[field as any];
        let targetId = this.data[field as unknown as keyof LocalDataT[K]] as any as string;
        if (!targetId) {
            return null as any;
        }
        if (CachedStoreNames.includes(targetTableName as any)) {
            return cache.get(targetTableName as any, targetId).then(result => {
                if (!result) {
                    return Promise.reject("Target of uniquely related field not found!");
                }
                return result;
            }) as unknown as RelatedDataT[K][S];
        }
        else {
            let resultParse = new Parse.Query(targetTableName);
            return resultParse.get(targetId).then(async parse => {
                const constr = Cache.Constructors[targetTableName as UncachedSchemaKeys];
                const _parse = parse as Parse.Object<PromisesRemapped<UncachedSchema[K]["value"]>>;
                return new constr(_parse) as any;
            });
        }
    }

    protected async nonUniqueRelated<S extends KnownKeys<RelatedDataT[K]>>(field: S): Promise<RelatedDataT[K][S]> {
        let cache = await Caches.get(this.conferenceId);
        let r2t: Record<string, string> = RelationsToTableNames[this.tableName];
        let targetTableName = r2t[field as any];
        let targetIds = this.data[field as unknown as keyof LocalDataT[K]] as any as Array<string>;
        if (CachedStoreNames.includes(targetTableName as any)) {
            return Promise.all(targetIds.map(targetId => cache.get(targetTableName as any, targetId).then(result => {
                return result;
            }))) as unknown as RelatedDataT[K][S];
        }
        else {
            let resultParse = new Parse.Query(targetTableName);
            return resultParse.containedIn("id", targetIds).map(async parse => {
                const constr = Cache.Constructors[targetTableName as UncachedSchemaKeys];
                const _parse = parse as Parse.Object<PromisesRemapped<UncachedSchema[K]["value"]>>;
                return new constr(_parse);
            }) as unknown as RelatedDataT[K][S];
        }
    }
}

export abstract class UncachedBase<K extends UncachedSchemaKeys> implements IBase<K> {
    constructor(
        protected tableName: K,
        protected parse: Parse.Object<PromisesRemapped<UncachedSchema[K]["value"]>>) {
    }

    async getUncachedParseObject(): Promise<Parse.Object<PromisesRemapped<WholeSchema[K]["value"]>>> {
        return this.parse;
    }

    get id(): string {
        return this.parse.id;
    }

    get createdAt(): Date {
        return this.parse.createdAt;
    }

    get updatedAt(): Date {
        return this.parse.updatedAt;
    }

    get acl(): ACLSchema {
        const x = this.parse.getACL();
        assert(x, "Could not get ACL.");
        return {
            permissionsById: x.permissionsById
        };
    }

    async save(): Promise<void> {
        await this.parse.save();
    }

    async delete(): Promise<void> {
        await this.parse.destroy();
    }

    protected async uniqueRelated<S extends KnownKeys<RelatedDataT[K]>>(field: S): Promise<RelatedDataT[K][S]> {
        let relTableNames = RelationsToTableNames[this.tableName];
        // @ts-ignore
        let relTableName = relTableNames[field];
        if (CachedStoreNames.includes(relTableName as any)) {
            return this.parse.get(field as any).fetch().then(async (result: any) => {
                let confId = result.get("conference").id;
                if (!confId) {
                    return Promise.reject("Can't handle cachable item that lacks a conference id...");
                }

                let cache = await Caches.get(confId);
                return cache.addItemToCache(result, relTableName as any, false);
            });
        }
        else {
            return this.parse.get(field as any).fetch().then((result: any) => {
                let constr = Cache.Constructors[relTableName as unknown as UncachedSchemaKeys];
                return new constr(result) as any;
            });
        }
    }

    protected async nonUniqueRelated<S extends KnownKeys<RelatedDataT[K]>>(field: S): Promise<RelatedDataT[K][S]> {
        let relTableNames = RelationsToTableNames[this.tableName];
        // @ts-ignore
        let relTableName = relTableNames[field];
        if (CachedStoreNames.includes(relTableName as any)) {
            let relation = this.parse.get(field as any) as Parse.Relation<any>;
            return relation.query().map(async (result: any) => {
                let confId = result.get("conference").id;
                if (!confId) {
                    return Promise.reject("Can't handle cachable item that lacks a conference id...");
                }

                let cache = await Caches.get(confId);
                return cache.addItemToCache(result, relTableName as any, false);
            }) as RelatedDataT[K][S];
        }
        else {
            let relation = this.parse.get(field as any) as Parse.Relation<any>;
            return relation.query().map((result: any) => {
                let constr = Cache.Constructors[relTableName as unknown as UncachedSchemaKeys];
                return new constr(result) as any;
            }) as RelatedDataT[K][S];
        }
    }
}

export type Base<K extends WholeSchemaKeys>
    = K extends CachedSchemaKeys ? CachedBase<K>
    : K extends UncachedSchemaKeys ? UncachedBase<K>
    : never;
