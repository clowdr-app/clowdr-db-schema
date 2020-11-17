import Parse from "parse";
import { keys } from "ts-transformer-keys";
import CachedSchema from "../../CachedSchema";
import { CachedSchemaKeys, PromisesRemapped, RelationsToTableNames, WholeSchemaKeys } from "../../WholeSchema";
import * as Interface from "../../Interface";
import * as Schema from "../../Schema";
import { CachedBase, LocalDataT, Constructor, CachedStoreNames } from "../../Interface/Base";
import { PromisedNonArrayFields, PromisedArrayFields, PromisedFields, KnownKeys } from "../../../Util";
import { OperationResult } from "..";
import assert from "assert";
import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { DataDeletedEventDetails, DataUpdatedEventDetails } from "../Cache";

export default class Cache {

    private static constructors:
        {
            [K in WholeSchemaKeys]: Constructor<K>;
        } | null = null;

    static get Constructors() {
        if (!Cache.constructors) {
            Cache.constructors = {
                AttachmentType: Interface.AttachmentType,
                ConferenceConfiguration: Interface.ConferenceConfiguration,
                Conference: Interface.Conference,
                Flair: Interface.Flair,
                PrivilegedConferenceDetails: Interface.PrivilegedConferenceDetails,
                ProgramItem: Interface.ProgramItem,
                ProgramItemAttachment: Interface.ProgramItemAttachment,
                ProgramPerson: Interface.ProgramPerson,
                ContentFeed: Interface.ContentFeed,
                ProgramSession: Interface.ProgramSession,
                ProgramSessionEvent: Interface.ProgramSessionEvent,
                ProgramTrack: Interface.ProgramTrack,
                Registration: Interface.Registration,
                _Role: Interface._Role,
                TextChat: Interface.TextChat,
                TextChatMessage: Interface.TextChatMessage,
                VideoRoom: Interface.VideoRoom,
                _User: Interface._User,
                UserProfile: Interface.UserProfile,
                YouTubeFeed: Interface.YouTubeFeed,
                ZoomRoom: Interface.ZoomRoom,
                WatchedItems: Interface.WatchedItems,
                AuditLog: Interface.AuditLog,
                Sponsor: Interface.Sponsor,
                SponsorContent: Interface.SponsorContent,
                Analytics: Interface.Analytics,
                Errors: Interface.Errors,
                RouletteHistory: Interface.RouletteHistory
            };
        }
        return Cache.constructors;
    }

    readonly Fields: {
        [K in CachedSchemaKeys]: Array<KnownKeys<CachedSchema[K]["value"]>>;
    } = {
            AttachmentType: keys<Schema.AttachmentType>(),
            Flair: keys<Schema.Flair>(),
            ProgramItemAttachment: keys<Schema.ProgramItemAttachment>(),
            ContentFeed: keys<Schema.ContentFeed>(),
            ProgramSession: keys<Schema.ProgramSession>(),
            ProgramSessionEvent: keys<Schema.ProgramSessionEvent>(),
            TextChat: keys<Schema.TextChat>(),
            TextChatMessage: keys<Schema.TextChatMessage>(),
            VideoRoom: keys<Schema.VideoRoom>(),
            UserProfile: keys<Schema.UserProfile>(),
            ProgramPerson: keys<Schema.ProgramPerson>(),
            ProgramItem: keys<Schema.ProgramItem>(),
            ProgramTrack: keys<Schema.ProgramTrack>(),
            Conference: keys<Schema.Conference>(),
            PrivilegedConferenceDetails: keys<Schema.PrivilegedConferenceDetails>(),
            YouTubeFeed: keys<Schema.YouTubeFeed>(),
            ZoomRoom: keys<Schema.ZoomRoom>(),
            ConferenceConfiguration: keys<Schema.ConferenceConfiguration>(),
            WatchedItems: keys<Schema.WatchedItems>(),
            Sponsor: keys<Schema.Sponsor>(),
            SponsorContent: keys<Schema.SponsorContent>()
        };

    readonly Relations: {
        [K in CachedSchemaKeys]: Array<KnownKeys<CachedSchema[K]["indexes"]>>;
    } = {
            AttachmentType: keys<PromisedFields<Schema.AttachmentType>>(),
            Flair: keys<PromisedFields<Schema.Flair>>(),
            ProgramItemAttachment: keys<PromisedFields<Schema.ProgramItemAttachment>>(),
            ContentFeed: keys<PromisedFields<Schema.ContentFeed>>(),
            ProgramSession: keys<PromisedFields<Schema.ProgramSession>>(),
            ProgramSessionEvent: keys<PromisedFields<Schema.ProgramSessionEvent>>(),
            TextChat: keys<PromisedFields<Schema.TextChat>>(),
            TextChatMessage: keys<PromisedFields<Schema.TextChatMessage>>(),
            VideoRoom: keys<PromisedFields<Schema.VideoRoom>>(),
            UserProfile: keys<PromisedFields<Schema.UserProfile>>(),
            ProgramPerson: keys<PromisedFields<Schema.ProgramPerson>>(),
            ProgramItem: keys<PromisedFields<Schema.ProgramItem>>(),
            ProgramTrack: keys<PromisedFields<Schema.ProgramTrack>>(),
            Conference: keys<PromisedFields<Schema.Conference>>(),
            PrivilegedConferenceDetails: keys<PromisedFields<Schema.PrivilegedConferenceDetails>>(),
            YouTubeFeed: keys<PromisedFields<Schema.YouTubeFeed>>(),
            ZoomRoom: keys<PromisedFields<Schema.ZoomRoom>>(),
            ConferenceConfiguration: keys<PromisedFields<Schema.ConferenceConfiguration>>(),
            WatchedItems: keys<PromisedFields<Schema.WatchedItems>>(),
            Sponsor: keys<PromisedFields<Schema.Sponsor>>(),
            SponsorContent: keys<PromisedFields<Schema.SponsorContent>>()
        };

    readonly UniqueRelations: {
        [K in CachedSchemaKeys]: Array<KnownKeys<CachedSchema[K]["indexes"]>>;
    } = {
            AttachmentType: keys<PromisedNonArrayFields<Schema.AttachmentType>>(),
            Flair: keys<PromisedNonArrayFields<Schema.Flair>>(),
            ProgramItemAttachment: keys<PromisedNonArrayFields<Schema.ProgramItemAttachment>>(),
            ContentFeed: keys<PromisedNonArrayFields<Schema.ContentFeed>>(),
            ProgramSession: keys<PromisedNonArrayFields<Schema.ProgramSession>>(),
            ProgramSessionEvent: keys<PromisedNonArrayFields<Schema.ProgramSessionEvent>>(),
            TextChat: keys<PromisedNonArrayFields<Schema.TextChat>>(),
            TextChatMessage: keys<PromisedNonArrayFields<Schema.TextChatMessage>>(),
            VideoRoom: keys<PromisedNonArrayFields<Schema.VideoRoom>>(),
            UserProfile: keys<PromisedNonArrayFields<Schema.UserProfile>>(),
            ProgramPerson: keys<PromisedNonArrayFields<Schema.ProgramPerson>>(),
            ProgramItem: keys<PromisedNonArrayFields<Schema.ProgramItem>>(),
            ProgramTrack: keys<PromisedNonArrayFields<Schema.ProgramTrack>>(),
            Conference: keys<PromisedNonArrayFields<Schema.Conference>>(),
            PrivilegedConferenceDetails: keys<PromisedNonArrayFields<Schema.PrivilegedConferenceDetails>>(),
            YouTubeFeed: keys<PromisedNonArrayFields<Schema.YouTubeFeed>>(),
            ZoomRoom: keys<PromisedNonArrayFields<Schema.ZoomRoom>>(),
            ConferenceConfiguration: keys<PromisedNonArrayFields<Schema.ConferenceConfiguration>>(),
            WatchedItems: keys<PromisedNonArrayFields<Schema.WatchedItems>>(),
            Sponsor: keys<PromisedNonArrayFields<Schema.Sponsor>>(),
            SponsorContent: keys<PromisedNonArrayFields<Schema.SponsorContent>>()
        };

    readonly NonUniqueRelations: {
        [K in CachedSchemaKeys]: Array<KnownKeys<CachedSchema[K]["indexes"]>>;
    } = {
            AttachmentType: keys<PromisedArrayFields<Schema.AttachmentType>>(),
            Flair: keys<PromisedArrayFields<Schema.Flair>>(),
            ProgramItemAttachment: keys<PromisedArrayFields<Schema.ProgramItemAttachment>>(),
            ContentFeed: keys<PromisedArrayFields<Schema.ContentFeed>>(),
            ProgramSession: keys<PromisedArrayFields<Schema.ProgramSession>>(),
            ProgramSessionEvent: keys<PromisedArrayFields<Schema.ProgramSessionEvent>>(),
            TextChat: keys<PromisedArrayFields<Schema.TextChat>>(),
            TextChatMessage: keys<PromisedArrayFields<Schema.TextChatMessage>>(),
            VideoRoom: keys<PromisedArrayFields<Schema.VideoRoom>>(),
            UserProfile: keys<PromisedArrayFields<Schema.UserProfile>>(),
            ProgramPerson: keys<PromisedArrayFields<Schema.ProgramPerson>>(),
            ProgramItem: keys<PromisedArrayFields<Schema.ProgramItem>>(),
            ProgramTrack: keys<PromisedArrayFields<Schema.ProgramTrack>>(),
            Conference: keys<PromisedArrayFields<Schema.Conference>>(),
            PrivilegedConferenceDetails: keys<PromisedArrayFields<Schema.PrivilegedConferenceDetails>>(),
            YouTubeFeed: keys<PromisedArrayFields<Schema.YouTubeFeed>>(),
            ZoomRoom: keys<PromisedArrayFields<Schema.ZoomRoom>>(),
            ConferenceConfiguration: keys<PromisedArrayFields<Schema.ConferenceConfiguration>>(),
            WatchedItems: keys<PromisedArrayFields<Schema.WatchedItems>>(),
            Sponsor: keys<PromisedArrayFields<Schema.Sponsor>>(),
            SponsorContent: keys<PromisedArrayFields<Schema.SponsorContent>>()
        };

    readonly KEY_PATH: "id" = "id";

    private conference: Promise<Parse.Object<PromisesRemapped<Schema.Conference>>> | null = null;

    constructor(
        public readonly conferenceId: string
    ) {
        this._onDataUpdated = {} as any;
        for (let key of CachedStoreNames) {
            this._onDataUpdated[key as CachedSchemaKeys] = new SimpleEventDispatcher() as any;
        }

        this._onDataDeleted = {} as any;
        for (let key of CachedStoreNames) {
            this._onDataDeleted[key as CachedSchemaKeys] = new SimpleEventDispatcher() as any;
        }
    }

    get IsDebugEnabled(): boolean {
        return false;
    }

    set IsDebugEnabled(value: boolean) {
    }

    get IsInitialised(): boolean {
        return true;
    }

    get Ready(): Promise<void> {
        return Promise.resolve();
    }

    get DatabaseName(): string {
        return `clowdr-${this.conferenceId}`;
    }

    private _onDataUpdated: {
        [K in CachedSchemaKeys]: SimpleEventDispatcher<DataUpdatedEventDetails<K>>
    };

    private _onDataDeleted: {
        [K in CachedSchemaKeys]: SimpleEventDispatcher<DataDeletedEventDetails<K>>
    };

    public onDataUpdated<K extends CachedSchemaKeys>(tableName: K): ISimpleEvent<DataUpdatedEventDetails<K>> {
        return (this._onDataUpdated[tableName] as SimpleEventDispatcher<DataUpdatedEventDetails<K>>).asEvent();
    }

    public onDataDeleted<K extends CachedSchemaKeys>(tableName: K): ISimpleEvent<DataDeletedEventDetails<K>> {
        return (this._onDataDeleted[tableName] as SimpleEventDispatcher<DataDeletedEventDetails<K>>).asEvent();
    }

    async initialise(): Promise<void> {
        this.conference
            = new Parse.Query<Parse.Object<PromisesRemapped<Schema.Conference>>>("Conference")
            .get(this.conferenceId).then(async x => {
                return x;
            });
    }

    async addItemToCache<K extends CachedSchemaKeys, T extends CachedBase<K>>(
        parse: Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>>,
        tableName: K
    ): Promise<T> {
        let schema: any = {
            id: parse.id
        };
        for (let _key of this.Fields[tableName]) {
            let key = _key as KnownKeys<LocalDataT[K]>;
            if (key !== "id") {
                // Yes these casts are safe

                let rels = this.Relations[tableName] as Array<string>;
                if (rels.includes(key as string)) {
                    let uniqRels = this.UniqueRelations[tableName] as Array<string>;
                    try {
                        if (uniqRels.includes(key as string)) {
                            let xs = parse.get(key as any);
                            schema[key] = xs.id;
                        }
                        else {
                            let r = parse.relation(key as any);
                            schema[key] = await r.query().map(x => x.id);
                        }
                    }
                    catch (e) {
                        try {
                            if (!e.toString().includes("Permission denied")) {
                                throw e;
                            }
                        }
                        catch {
                            throw e;
                        }
                    }
                }
                else {
                    schema[key] = parse.get(key as any);
                }
            }
        }

        const constr = Cache.Constructors[tableName];
        return new constr(this.conferenceId, schema, parse as any) as unknown as T;
    }

    public async deleteDatabase(
        reload: boolean = false,
        retryDelay: number = 5000
    ): Promise<OperationResult> {
        return Promise.reject("Mock cache will always reject");
    }

    private async newParseQuery<K extends CachedSchemaKeys>(tableName: K) {
        assert(this.conference);
        let conf = await this.conference;

        let query = new Parse.Query<Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>>>(tableName);
        if (tableName !== "Conference") {
            let r2t: Record<string, string> = RelationsToTableNames[tableName];
            if ("conference" in r2t) {
                query.equalTo("conference" as any, conf as any);
            }
        }
        return query;
    }

    async get<K extends CachedSchemaKeys, T extends CachedBase<K>>(
        tableName: K,
        id: string
    ): Promise<T | null> {
        let query = await this.newParseQuery(tableName);
        try {
            let resultP = query.get(id);
            let result = await resultP;
            return await this.addItemToCache<K, T>(result, tableName);
        }
        catch (reason) {
            return null;
        }
    }

    async getAll<K extends CachedSchemaKeys, T extends CachedBase<K>>(
        tableName: K
    ): Promise<Array<T>> {
        let query = await this.newParseQuery(tableName);
        return query.map(async parse => {
            return await this.addItemToCache<K, T>(parse, tableName);
        }).catch(_reason => {
            return [];
        });
    }
}
