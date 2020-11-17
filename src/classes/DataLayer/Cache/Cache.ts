import Parse, { LiveQueryClient, LiveQuerySubscription } from "parse";
import { keys } from "ts-transformer-keys";
import DebugLogger from "../../DebugLogger";
import CachedSchema, { SchemaVersion } from "../CachedSchema";
import { CachedSchemaKeys, PromisesRemapped, RelationsToTableNames, WholeSchemaKeys } from "../WholeSchema";
import * as Interface from "../Interface";
import * as Schema from "../Schema";
import { CachedBase, CachedStoreNames, LocalDataT, Constructor } from "../Interface/Base";
import { PromisedNonArrayFields, PromisedArrayFields, PromisedFields, KnownKeys } from "../../Util";
import { IDBPDatabase, openDB, deleteDB, IDBPTransaction } from "idb";
import { OperationResult } from ".";
import assert from "assert";
import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";

type ExtendedCachedSchema
    = CachedSchema
    & {
        LocalRefillTimes: {
            key: string;
            value: {
                // Must be called `id` to work with the current implementation
                // of createStore
                id: CachedSchemaKeys | "ENTIRE_CACHE",
                lastRefillAt: Date
            }
        }
    };

type ExtendedCachedSchemaKeys = KnownKeys<ExtendedCachedSchema>;

export type DataUpdatedEventDetails<K extends CachedSchemaKeys> = {
    table: K;
    objects: CachedBase<K>[];
};

export type DataDeletedEventDetails<K extends CachedSchemaKeys> = {
    table: K;
    objectId: string;
};

export default class Cache {
    // The 'any' can't be replaced here - it would require dependent types.
    /**
     * Do not use directly - use `Cache.Constructors` instead.
     * 
     * This variable is the memoized object. It is necessary to generate the
     * object after the page has initialized otherwise the fields will be set
     * to `undefined`.
     */
    private static constructors:
        {
            [K in WholeSchemaKeys]: Constructor<K>;
        } | null = null;
    /**
     * Constructors of both cached and uncached tables.
     */
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

    /**
     * All fields including related fields.
     */
    private static fields: {
        [K in CachedSchemaKeys]: Array<KnownKeys<CachedSchema[K]["value"]>>;
    } | null = null;
    static get Fields() {
        if (!Cache.fields) {
            Cache.fields =
            {
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
        }
        return Cache.fields;
    }

    private static relations: {
        [K in CachedSchemaKeys]: Array<KnownKeys<CachedSchema[K]["indexes"]>>;
    } | null = null;

    /**
     * All relations including to uncached tables.
     */
    static get Relations() {
        if (!Cache.relations) {
            Cache.relations =
            {
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
        }
        return Cache.relations;
    }

    private static uniqueRelations: {
        [K in CachedSchemaKeys]: Array<KnownKeys<CachedSchema[K]["indexes"]>>;
    } | null = null;

    /**
     * All relations to unique items including to uncached tables.
     */
    static get UniqueRelations() {
        if (!Cache.uniqueRelations) {
            Cache.uniqueRelations =
            {
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
        }
        return Cache.uniqueRelations;
    }

    /**
     * All relations to non-unique items including to uncached tables.
     */
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

    // If changing this list, remember to update the `afterSave` callbacks in
    // `backend/cloud/cacheStatus.js`
    readonly ProgramTableNames: Array<CachedSchemaKeys> = [
        "ProgramItem",
        "ProgramItemAttachment",
        "ProgramPerson",
        "ContentFeed",
        "ProgramSession",
        "ProgramSessionEvent",
        "ProgramTrack",
        "Flair"
    ];

    readonly KEY_PATH: "id" = "id";

    private dbPromise: Promise<IDBPDatabase<ExtendedCachedSchema>> | null = null;
    private conference: Promise<Parse.Object<PromisesRemapped<Schema.Conference>> | null> | null = null;

    private isInitialised: boolean = false;
    private isUserAuthenticated: boolean = false;
    private userSessionToken: string | null = null;
    private isRefreshRunning: boolean = false;

    private logger: DebugLogger = new DebugLogger("Cache");
    private readonly cacheStaleTime = 1000 * 60 * 60 * 24; // 24 hours
    private readonly cacheInactiveTime = 1000 * 60 * 10; // 10 minutes
    private readonly liveQueryTrustedTime = 1000 * 60 * 1; // 1 minutes

    private static parseLive: Parse.LiveQueryClient | null = null;
    private liveQuerySubscriptions: {
        [K in CachedSchemaKeys]?: LiveQuerySubscription;
    } = {};

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

    constructor(
        public readonly conferenceId: string,
        enableDebug: boolean = false) {
        if (enableDebug) {
            this.logger.enable();
        }
        else {
            this.logger.disable();
        }

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
        return this.logger.isEnabled;
    }

    set IsDebugEnabled(value: boolean) {
        if (value !== this.logger.isEnabled) {
            if (value) {
                this.logger.enable();
            }
            else {
                this.logger.disable();
            }
        }
    }

    get IsInitialised(): boolean {
        return this.isInitialised;
    }

    get Ready(): Promise<boolean> {
        if (this.dbPromise) {
            // Wrap in a new promise to hide the internal one
            return new Promise(async (resolve, reject) => {
                try {
                    await this.dbPromise;
                    const conf = await this.conference;
                    resolve(!!conf);
                }
                catch {
                    reject("Cache failed to initialise.");
                }
            });
        }
        else {
            return Promise.reject("You must call `initialise` first.");
        }
    }

    get IsUserAuthenticated(): boolean {
        return this.isUserAuthenticated;
    }

    public async updateUserAuthenticated(value: { authed: false } | { authed: true; sessionToken: string }, forceRefill: boolean) {
        this.isUserAuthenticated = value.authed;
        if (value.authed) {
            this.userSessionToken = value.sessionToken;
            this.refresh(forceRefill);
        }
        else {
            await this.unsubscribeFromUpdates();
            this.userSessionToken = null;
        }
    }

    get DatabaseName(): string {
        return `clowdr-${this.conferenceId}`;
    }

    /**
     * Initialises the cache.
     */
    async initialise(): Promise<void> {
        if (!this.isInitialised) {
            if (!this.dbPromise) {
                this.logger.info("Opening database.");
                this.conference = new Promise(async (resolve, reject) => {
                    try {
                        this.dbPromise = openDB<ExtendedCachedSchema>(this.DatabaseName, SchemaVersion, {
                            upgrade: this.upgrade.bind(this),
                            blocked: this.blocked.bind(this),
                            blocking: this.blocking.bind(this),
                            terminated: this.terminated.bind(this)
                        });

                        // These should have already been asserted in index.ts
                        // but we do so again here to make TypeScript happy.
                        assert(process.env.REACT_APP_PARSE_APP_ID, "REACT_APP_PARSE_APP_ID not provided.");
                        assert(process.env.REACT_APP_PARSE_DOMAIN, "REACT_APP_PARSE_DOMAIN not provided.");
                        assert(process.env.REACT_APP_PARSE_JS_KEY, "REACT_APP_PARSE_JS_KEY not provided.");

                        if (!Cache.parseLive) {
                            // @ts-ignore
                            Cache.parseLive = new LiveQueryClient({
                                applicationId: process.env.REACT_APP_PARSE_APP_ID,
                                serverURL: process.env.REACT_APP_PARSE_DOMAIN,
                                javascriptKey: process.env.REACT_APP_PARSE_JS_KEY
                            });
                            // @ts-ignore
                            Cache.parseLive.on('error', (error) => { this.logger.error('Parse LiveQuery Error', error); });
                            Cache.parseLive.open();
                        }

                        this.isInitialised = true;

                        try {
                            let confP = new Parse.Query<Parse.Object<PromisesRemapped<Schema.Conference>>>("Conference").get(this.conferenceId) || null;
                            let conf = await confP;
                            if (!conf) {
                                resolve(null);
                                return;
                            }

                            resolve(conf);
                        }
                        catch (e) {
                            this.logger.error("Error getting conference instance", e);
                            if (e.toString().includes("Object not found")) {
                                await this.deleteDatabase(false);
                            }
                            resolve(null);
                        }
                    }
                    catch (e) {
                        this.logger.error(`Error initialising cache.`, e);
                        reject(e);
                    }
                });
            }
        }
        else {
            this.logger.info("Already initialised.");
        }
    }

    private async getLocalRefillTimes(db: IDBPDatabase<ExtendedCachedSchema>): Promise<{
        [K in CachedSchemaKeys]: Date | undefined
    }> {
        let localRefillTimes = await db.getAll("LocalRefillTimes");
        let result: any = {};
        localRefillTimes.forEach(x => {
            result[x.id] = x.lastRefillAt;
        });
        return result;
    }

    public async refresh(forceRefill: boolean): Promise<void> {
        if (!this.isInitialised || !this.dbPromise) {
            throw new Error("You must call initialised first!");
        }

        if (this.IsUserAuthenticated && !this.isRefreshRunning) {
            this.isRefreshRunning = true;

            this.isRefreshRunning = await this.dbPromise.then(async db => {
                let freshConference = await this.conference;
                if (freshConference) {
                    let remoteLastProgramUpdateTime = freshConference.get("lastProgramUpdateTime") ?? new Date(0);
                    try {
                        let localRefillTimes = await this.getLocalRefillTimes(db);
                        const now = Date.now();

                        this.fillingEntireCachePromise = new Promise(async (resolve, reject) => {
                            try {
                                let localRefillTime = localRefillTimes["ENTIRE_CACHE"] ?? new Date(0);
                                if (localRefillTime.getTime() + this.cacheInactiveTime < now
                                    || remoteLastProgramUpdateTime.getTime() > now) {
                                    const {
                                        Conference,

                                        AttachmentType,
                                        ConferenceConfiguration,
                                        ContentFeed,
                                        Flair,
                                        PrivilegedConferenceDetails,
                                        ProgramPerson,
                                        ProgramItem,
                                        ProgramItemAttachment,
                                        ProgramSession,
                                        ProgramSessionEvent,
                                        ProgramTrack,
                                        Sponsor,
                                        SponsorContent,
                                        TextChat,
                                        TextChatMessage,
                                        UserProfile,
                                        VideoRoom,
                                        WatchedItems,
                                        YouTubeFeed,
                                        ZoomRoom
                                    } = await Parse.Cloud.run("fetch-cache", {
                                        conference: this.conferenceId
                                    });

                                    const _this = this;
                                    async function updateCacheTable<
                                        K extends CachedSchemaKeys,
                                        T extends CachedBase<K>
                                    >(
                                        tableName: K,
                                        data: Array<Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>>>
                                    ) {
                                        await db.clear(tableName);

                                        const results: T[] = await Promise.all(data.map(parse => _this.addItemToCache<K, T>(parse, tableName, true, db)));

                                        const ev = _this._onDataUpdated[tableName] as SimpleEventDispatcher<DataUpdatedEventDetails<K>>;
                                        ev.dispatchAsync({
                                            table: tableName,
                                            objects: results as CachedBase<K>[]
                                        });

                                        return results;
                                    }

                                    const [resultConference] = await updateCacheTable<"Conference", Interface.Conference>("Conference", [Conference]);
                                    const resultsAttachmentType = await updateCacheTable<"AttachmentType", Interface.AttachmentType>("AttachmentType", AttachmentType);
                                    const resultsConferenceConfiguration = await updateCacheTable<"ConferenceConfiguration", Interface.ConferenceConfiguration>("ConferenceConfiguration", ConferenceConfiguration);
                                    const resultsContentFeed = await updateCacheTable<"ContentFeed", Interface.ContentFeed>("ContentFeed", ContentFeed);
                                    const resultsFlair = await updateCacheTable<"Flair", Interface.Flair>("Flair", Flair);
                                    const resultsPrivilegedConferenceDetails = await updateCacheTable<"PrivilegedConferenceDetails", Interface.PrivilegedConferenceDetails>("PrivilegedConferenceDetails", PrivilegedConferenceDetails);
                                    const resultsProgramPerson = await updateCacheTable<"ProgramPerson", Interface.ProgramPerson>("ProgramPerson", ProgramPerson);
                                    const resultsProgramItem = await updateCacheTable<"ProgramItem", Interface.ProgramItem>("ProgramItem", ProgramItem);
                                    const resultsProgramItemAttachment = await updateCacheTable<"ProgramItemAttachment", Interface.ProgramItemAttachment>("ProgramItemAttachment", ProgramItemAttachment);
                                    const resultsProgramSession = await updateCacheTable<"ProgramSession", Interface.ProgramSession>("ProgramSession", ProgramSession);
                                    const resultsProgramSessionEvent = await updateCacheTable<"ProgramSessionEvent", Interface.ProgramSessionEvent>("ProgramSessionEvent", ProgramSessionEvent);
                                    const resultsProgramTrack = await updateCacheTable<"ProgramTrack", Interface.ProgramTrack>("ProgramTrack", ProgramTrack);
                                    const resultsSponsor = await updateCacheTable<"Sponsor", Interface.Sponsor>("Sponsor", Sponsor);
                                    const resultsSponsorContent = await updateCacheTable<"SponsorContent", Interface.SponsorContent>("SponsorContent", SponsorContent);
                                    const resultsTextChat = await updateCacheTable<"TextChat", Interface.TextChat>("TextChat", TextChat);
                                    const resultsTextChatMessage = await updateCacheTable<"TextChatMessage", Interface.TextChatMessage>("TextChatMessage", TextChatMessage);
                                    const resultsUserProfile = await updateCacheTable<"UserProfile", Interface.UserProfile>("UserProfile", UserProfile);
                                    const resultsVideoRoom = await updateCacheTable<"VideoRoom", Interface.VideoRoom>("VideoRoom", VideoRoom);
                                    const resultsWatchedItems = await updateCacheTable<"WatchedItems", Interface.WatchedItems>("WatchedItems", WatchedItems);
                                    const resultsYouTubeFeed = await updateCacheTable<"YouTubeFeed", Interface.YouTubeFeed>("YouTubeFeed", YouTubeFeed);
                                    const resultsZoomRoom = await updateCacheTable<"ZoomRoom", Interface.ZoomRoom>("ZoomRoom", ZoomRoom);

                                    db.put("LocalRefillTimes", { id: "ENTIRE_CACHE", lastRefillAt: new Date(now) });

                                    resolve({
                                        Conference: resultConference,
                                        AttachmentType: resultsAttachmentType,
                                        ConferenceConfiguration: resultsConferenceConfiguration,
                                        ContentFeed: resultsContentFeed,
                                        Flair: resultsFlair,
                                        PrivilegedConferenceDetails: resultsPrivilegedConferenceDetails,
                                        ProgramPerson: resultsProgramPerson,
                                        ProgramItem: resultsProgramItem,
                                        ProgramItemAttachment: resultsProgramItemAttachment,
                                        ProgramSession: resultsProgramSession,
                                        ProgramSessionEvent: resultsProgramSessionEvent,
                                        ProgramTrack: resultsProgramTrack,
                                        Sponsor: resultsSponsor,
                                        SponsorContent: resultsSponsorContent,
                                        TextChat: resultsTextChat,
                                        TextChatMessage: resultsTextChatMessage,
                                        UserProfile: resultsUserProfile,
                                        VideoRoom: resultsVideoRoom,
                                        WatchedItems: resultsWatchedItems,
                                        YouTubeFeed: resultsYouTubeFeed,
                                        ZoomRoom: resultsZoomRoom,
                                    });
                                }
                                else {
                                    resolve(false);
                                }
                            }
                            catch (e) {
                                reject(e);
                            }
                            finally {
                                this.fillingEntireCachePromise = null;
                            }
                        });

                        await Promise.all(CachedStoreNames.map(async store => {
                            try {
                                await this.subscribeToUpdates(store);
                            }
                            catch (e) {
                                this.logger.error(`Could not update cache table ${store} for conference ${this.conferenceId}`, e);
                            }
                        }));

                        // await Promise.all(CachedStoreNames.map(async store => {
                        //     try {
                        //         await this.subscribeToUpdates(store);

                        //         let localRefillTime = localRefillTimes[store] ?? new Date(0);
                        //         let isProgramTable = this.ProgramTableNames.includes(store);
                        //         let shouldUpdate =
                        //             forceRefill ||
                        //             (isProgramTable
                        //                 ? remoteLastProgramUpdateTime.getTime() > localRefillTime.getTime() - 10000
                        //                 : localRefillTime.getTime() + this.cacheInactiveTime < now);

                        //         if (shouldUpdate) {
                        //             let shouldClear = forceRefill || localRefillTime.getTime() + this.cacheStaleTime < now;
                        //             let fillFrom = localRefillTimes[store];
                        //             if (shouldClear || isProgramTable) {
                        //                 await db.clear(store);
                        //                 fillFrom = new Date(0);
                        //             }

                        //             db.put("LocalRefillTimes", { id: store, lastRefillAt: new Date(now) });

                        //             return this.fillCache(store, db, fillFrom);
                        //         }

                        //         if (shouldUpdate || localRefillTime.getTime() + this.liveQueryTrustedTime > now) {
                        //             db.put("LocalRefillTimes", { id: store, lastRefillAt: new Date(now) });
                        //         }
                        //     }
                        //     catch (e) {
                        //         this.logger.error(`Could not update cache table ${store} for conference ${this.conferenceId}`, e);
                        //     }
                        //     return void 0;
                        // }));
                    }
                    catch (e) {
                        if (e.toString().includes("'LocalRefillTimes' is not a known object store name")) {
                            this.deleteDatabase(true);
                        }
                        else {
                            throw e;
                        }
                    }
                }

                return false;
            }).catch(reason => {
                this.logger.error(`Error refreshing cache`, reason);

                return false;
            });
        }
    }

    private async subscribeToUpdates<K extends CachedSchemaKeys>(tableName: K): Promise<void> {
        if (!Cache.parseLive) {
            throw new Error("Cannot subscribe to Live Query when client is not initialised.");
        }

        if (!this.userSessionToken) {
            throw new Error("Cannot subscribe to Live Query when user is not authorized.");
        }

        if (!this.liveQuerySubscriptions[tableName]) {
            let query = await this.newParseQuery(tableName);
            let subscription = Cache.parseLive.subscribe(query, this.userSessionToken);
            this.liveQuerySubscriptions[tableName] = subscription;

            subscription.on("create", (parseObj) => {
                this.logger.info(`Parse Live Query: ${tableName} created in conference ${this.conferenceId}`, parseObj);
                this.addItemToCache(parseObj as any, tableName, false);
            });

            subscription.on("update", (parseObj) => {
                this.logger.info(`Parse Live Query: ${tableName} updated in conference ${this.conferenceId}`, parseObj);
                this.addItemToCache(parseObj as any, tableName, false);
            });

            subscription.on("enter", (parseObj) => {
                this.logger.info(`Parse Live Query: ${tableName} entered in conference ${this.conferenceId}`, parseObj);
                this.addItemToCache(parseObj as any, tableName, false);
            });

            subscription.on("leave", (parseObj) => {
                this.logger.info(`Parse Live Query: ${tableName} left in conference ${this.conferenceId}`, parseObj);
                this.removeItemFromCache(tableName, parseObj.id);
            });

            subscription.on("delete", (parseObj) => {
                this.logger.info(`Parse Live Query: ${tableName} deleted from conference ${this.conferenceId}`, parseObj);
                this.removeItemFromCache(tableName, parseObj.id);
            });

            // This isn't in the TypeScript types, but it is in the docs & API.
            // https://docs.parseplatform.org/js/guide/#error-event-1
            subscription.on("error" as any, (error) => {
                this.logger.error(`Parse Live Query: Error encountered for ${tableName} and conference ${this.conferenceId}`, error);
            });

            await (subscription as any).subscribePromise;
        }
    }

    private async unsubscribeFromUpdates() {
        for (let key in this.liveQuerySubscriptions) {
            this.liveQuerySubscriptions[key]?.unsubscribe?.();
            delete this.liveQuerySubscriptions[key];
        }
    }

    private fillingEntireCachePromise: Promise<{
        Conference: Interface.Conference,
        AttachmentType: Array<Interface.AttachmentType>,
        ConferenceConfiguration: Array<Interface.ConferenceConfiguration>,
        ContentFeed: Array<Interface.ContentFeed>,
        Flair: Array<Interface.Flair>,
        PrivilegedConferenceDetails: Array<Interface.PrivilegedConferenceDetails>,
        ProgramPerson: Array<Interface.ProgramPerson>,
        ProgramItem: Array<Interface.ProgramItem>,
        ProgramItemAttachment: Array<Interface.ProgramItemAttachment>,
        ProgramSession: Array<Interface.ProgramSession>,
        ProgramSessionEvent: Array<Interface.ProgramSessionEvent>,
        ProgramTrack: Array<Interface.ProgramTrack>,
        Sponsor: Array<Interface.Sponsor>,
        SponsorContent: Array<Interface.SponsorContent>,
        TextChat: Array<Interface.TextChat>,
        TextChatMessage: Array<Interface.TextChatMessage>,
        UserProfile: Array<Interface.UserProfile>,
        VideoRoom: Array<Interface.VideoRoom>,
        WatchedItems: Array<Interface.WatchedItems>,
        YouTubeFeed: Array<Interface.YouTubeFeed>,
        ZoomRoom: Array<Interface.ZoomRoom>,
    } | false> | null = null;

    private fillingCachePromises: { [K in CachedSchemaKeys]?: Promise<Array<any>> } = {};
    private async fillCache<K extends CachedSchemaKeys, T extends CachedBase<K>>(
        tableName: K,
        db: IDBPDatabase<ExtendedCachedSchema> | null = null,
        fillFrom?: Date
    ): Promise<Array<T>> {
        if (!this.IsInitialised || !this.dbPromise) {
            return Promise.reject("Not initialised");
        }

        if (!this.IsUserAuthenticated) {
            throw new Error("Cannot refresh cache when not authenticated");
        }

        const forceFill = async () => {
            let resultP = this.fillingCachePromises[tableName];
            if (!resultP) {
                this.fillingCachePromises[tableName] = resultP = new Promise(async (resolve, reject) => {
                    try {
                        if (!db && this.dbPromise) {
                            db = await this.dbPromise;
                        }

                        let itemsQ = await this.newParseQuery(tableName);

                        if (fillFrom) {
                            itemsQ.greaterThanOrEqualTo("updatedAt", fillFrom as any);
                        }

                        let results: T[] = [];
                        await itemsQ.eachBatch(async parseObjs => {
                            const mapped = await Promise.all(parseObjs.map(parse => this.addItemToCache<K, T>(parse, tableName, true, db)));
                            results = results.concat(mapped);
                        }, {
                            batchSize: 1000
                        });

                        if (db && fillFrom) {
                            db.put("LocalRefillTimes", { id: tableName, lastRefillAt: new Date() });
                        }

                        let ev = this._onDataUpdated[tableName] as SimpleEventDispatcher<DataUpdatedEventDetails<K>>;
                        ev.dispatchAsync({
                            table: tableName,
                            objects: results as CachedBase<K>[]
                        });

                        this.fillingCachePromises[tableName] = undefined;
                        resolve(results);
                    }
                    catch (e) {
                        this.fillingCachePromises[tableName] = undefined;
                        reject(e);
                    }
                });
            }

            return resultP as Promise<Array<T>>;
        };

        if (this.fillingEntireCachePromise) {
            return this.fillingEntireCachePromise.then(async r => {
                if (!r) {
                    return forceFill();
                }
                else {
                    if (tableName === "Conference") {
                        return [r.Conference] as unknown[] as T[];
                    }
                    else {
                        return r[tableName] as unknown[] as T[];
                    }
                }
            });
        }
        else {
            return forceFill();
        }
    }

    async addItemToCache<K extends CachedSchemaKeys, T extends CachedBase<K>>(
        parse: Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>>,
        tableName: K,
        supressEvents: boolean,
        _db: IDBPDatabase<ExtendedCachedSchema> | null = null,
    ): Promise<T> {
        let schema: any = {
            id: parse.id,
            acl: {
                permissionsById: parse.getACL()?.permissionsById
            }
        };
        for (let _key of Cache.Fields[tableName]) {
            let key = _key as KnownKeys<LocalDataT[K]>;
            if (key !== "id" && key !== "acl") {
                // Yes these casts are safe

                let rels = Cache.Relations[tableName] as Array<string>;
                if (rels.includes(key as string)) {
                    let uniqRels = Cache.UniqueRelations[tableName] as Array<string>;
                    try {
                        if (uniqRels.includes(key as string)) {
                            let xs = parse.get(key as any);
                            // It is possible for the pointer to be optional 
                            // e.g. `ProgramPerson.profile: UserProfile | undefined`
                            if (xs) {
                                schema[key] = xs.id;
                            }
                        }
                        // Avoid attempting to fetch data that we aren't allowed to access
                        else if (this.IsUserAuthenticated) {
                            let r = parse.relation(key as any);
                            let related: string[] = [];
                            await r.query().eachBatch(x => {
                                related = related.concat(x.map(x => x.id));
                            }, {
                                batchSize: 1000
                            });
                            schema[key] = related;
                        }
                    }
                    catch (e) {
                        try {
                            if (!e.toString().includes("Permission denied")) {
                                this.logger.error(e);
                                throw e;
                            }
                        }
                        catch {
                            this.logger.error(e);
                            throw e;
                        }
                    }
                }
                else {
                    schema[key] = parse.get(key as any);

                    // TODO: Save `Parse.File` objects "properly"
                    // (`_previousSave` is a `Promise | undefined` which, when
                    // an "update due to save" occurs, contains a Promise, but
                    // on first page load is undefined.)
                    if (typeof schema[key] === "object" && "_previousSave" in schema[key]) {
                        schema[key]["_previousSave"] = undefined;
                    }
                }
            }
        }

        try {
            if (_db) {
                this.logger.info("Filling item", {
                    conferenceId: this.conferenceId,
                    tableName: tableName,
                    id: parse.id,
                    value: schema
                });
                await _db.put(tableName, schema);
            }
            else if (this.dbPromise) {
                this.logger.info("Filling item", {
                    conferenceId: this.conferenceId,
                    tableName: tableName,
                    id: parse.id,
                    value: schema
                });

                let db = await this.dbPromise;
                await db.put(tableName, schema);
            }
        }
        catch (e) {
            // Occurs when we get back data (like Conference) before the cache
            // has been initialised (likely on first unauthenticated load of a
            // conference).
            if (!e.toString().includes("not a known object store name")) {
                throw e;
            }
        }

        const constr = Cache.Constructors[tableName];
        let result = new constr(this.conferenceId, schema, parse as any) as unknown as T;

        if (!supressEvents) {
            let ev = this._onDataUpdated[tableName] as SimpleEventDispatcher<DataUpdatedEventDetails<K>>;
            ev.dispatchAsync({
                table: tableName,
                objects: [result]
            });
        }

        return result;
    }

    private async removeItemFromCache<K extends CachedSchemaKeys, T extends CachedBase<K>>(
        tableName: K,
        id: string): Promise<void> {
        let db = await this.dbPromise;
        await db?.delete(tableName, id);

        let ev = this._onDataDeleted[tableName] as SimpleEventDispatcher<DataDeletedEventDetails<K>>;
        ev.dispatchAsync({
            table: tableName,
            objectId: id
        });
    }

    /**
     * Shuts down cache providers and closes the database connection.
     */
    private async closeConnection() {
        if (this.dbPromise) {
            await this.unsubscribeFromUpdates();

            this.conference = null;

            this.logger.info("Closing connection to database.");
            const db = await this.dbPromise;
            db.close();
        }

        this.isInitialised = false;
    }

    /**
     * Deletes the underlying IndexedDB database.
     *
     * @param retryDelay Optional. Number of milliseconds to wait before
     * reattepting to delete the database.
     *
     * @returns Success if the database was deleted.
     *
     * All other connections to the database (including in other tabs) must be
     * closed before the database can be deleted. After the first attempt, this
     * function will wait to give other connections time to close, followed by
     * one re-attempt.
     */
    public async deleteDatabase(
        reload: boolean = false,
        retryDelay: number = 5000
    ): Promise<OperationResult> {
        let result = OperationResult.Success;

        this.logger.info("Deleting database...");

        await this.closeConnection();

        // Define a local function for attempting to delete the database
        const attemptDeletion = () => deleteDB(this.DatabaseName, {
            blocked: () => {
                result = OperationResult.Fail;
                this.logger.info(`Initial attempt to delete database (${this.DatabaseName}) failed because the operation is blocked by another open connection.`);
            }
        });

        // First attempt to delete the database
        this.logger.info("Commencing first attempt to delete database.");
        await attemptDeletion();

        if (result !== OperationResult.Success) {
            this.logger.info("Commencing second attempt to delete database.");

            // The database couldn't be deleted because there are open
            // connections to it.

            // Wait some time for the connections to close
            await new Promise((resolve) => setTimeout(async () => {
                result = OperationResult.Success;

                // Re-attempt to delete the database
                await attemptDeletion();

                if (result === OperationResult.Success) {
                    this.logger.info("Second attempt to delete database was successful.");
                }
                else {
                    this.logger.error("Second attempt to delete database failed!");
                }

                resolve();
            }, retryDelay));
        }
        else {
            this.logger.info("First attempt to delete database was successful.");
        }

        if (reload && result === OperationResult.Success) {
            window.location.reload();
        }

        return result;
    }

    private async createStore<K extends ExtendedCachedSchemaKeys>(t: IDBPTransaction<ExtendedCachedSchema>, name: K) {
        this.logger.info(`Creating store: ${name}`);

        t.db.createObjectStore<K>(name, {
            keyPath: this.KEY_PATH
        });
    }

    private async upgradeStore(t: IDBPTransaction<ExtendedCachedSchema>, name: CachedSchemaKeys) {
        this.logger.info(`Upgrading store: ${name}`);

        let items = await t.objectStore(name).getAll();
        for (let item of items) {
            this.upgradeItem(t, name, item);
        }
    }

    private async deleteStore(t: IDBPTransaction<ExtendedCachedSchema>, name: string) {
        this.logger.info(`Deleting store: ${name}`);
        t.db.deleteObjectStore(name as any);
    }

    private async upgradeItem<K extends CachedSchemaKeys>(
        t: IDBPTransaction<ExtendedCachedSchema>,
        name: K,
        item: CachedSchema[K]["value"]): Promise<void> {
        let StoreFieldNames = Cache.Fields[name] as Array<string>;
        let updatedItem = { ...item };
        let edited = false;
        for (let key in item) {
            if (!StoreFieldNames.includes(key)) {
                delete updatedItem[key];
                edited = true;
            }
        }
        if (edited) {
            await t.objectStore(name).put(updatedItem);
        }
    }

    /**
     * Called if this version of the database has never been opened before. Use
     * it to specify the schema for the database.
     * @param database A database instance that you can use to add/remove stores
     * and indexes.
     * @param oldVersion Last version of the database opened by the user.
     * @param newVersion Whatever new version you provided.
     * @param transaction The transaction for this upgrade. This is useful if
     * you need to get data from other stores as part of a migration.
     */
    private async upgrade(
        db: IDBPDatabase<ExtendedCachedSchema>,
        oldVersion: number,
        newVersion: number,
        transaction: IDBPTransaction<ExtendedCachedSchema>
    ): Promise<void> {
        if (oldVersion === 0) {
            this.logger.info(`Creating cache database at version ${newVersion}.`);
        }
        else {
            this.logger.info(`Database upgrade from version ${oldVersion} to ${newVersion}.`);
        }

        transaction.done.catch((reason) => {
            this.logger.error("Database upgrade transaction rejected - not implemented.", reason);
        });

        let toUpgrade: Array<CachedSchemaKeys> = [];
        let toCreate: Array<CachedSchemaKeys> = [];
        let toDelete: Array<string> = [];
        let existingStoreNames: Array<ExtendedCachedSchemaKeys> = [...db.objectStoreNames];

        if (!existingStoreNames.includes("LocalRefillTimes")) {
            this.createStore(transaction, "LocalRefillTimes");
        }

        // Gather stores to upgrade or delete
        for (let storeName of existingStoreNames) {
            if (CachedStoreNames.includes(storeName as CachedSchemaKeys)) {
                toUpgrade.push(storeName as CachedSchemaKeys);
            }
            else if (storeName !== "LocalRefillTimes") {
                toDelete.push(storeName);
            }
        }

        // Gather stores to create
        for (let storeName of CachedStoreNames) {
            if (!existingStoreNames.includes(storeName)) {
                toCreate.push(storeName);
            }
        }

        this.logger.info("Store changes", {
            toCreate: toCreate,
            toUpgrade: toUpgrade,
            toDelete: toDelete
        });

        for (let storeName of toDelete) {
            await this.deleteStore(transaction, storeName);
        }

        for (let storeName of toCreate) {
            this.createStore(transaction, storeName);
        }

        for (let storeName of toUpgrade) {
            this.upgradeStore(transaction, storeName);
        }

        return transaction.done;
    }

    /**
     * Called if there are older versions of the database open on the origin, so
     * this version cannot open.
     */
    private async blocked(): Promise<void> {
        // TODO: blocked
        this.logger.error("Database blocked alert - not implemented.");
    }

    /**
     * Called if this connection is blocking a future version of the database
     * from opening.
     */
    private async blocking(): Promise<void> {
        // TODO: blocking
        this.logger.error("Database blocking alert - not implemented.");
        //TODO: Reenable this condition?
        //if (this.IsDebugEnabled) {
        this.logger.warn("Debug enabled. Closing cache connection.");
        this.closeConnection();
        //}
    }

    /**
     * Called if the browser abnormally terminates the connection. This is not
     * called when db.close() is called.
     */
    private async terminated(): Promise<void> {
        // TODO: terminated
        this.logger.error("Database terminated alert - not implemented.");
        //TODO: Reenable this condition?
        //if (this.IsDebugEnabled) {
        this.logger.warn("Debug enabled. Closing cache connection.");
        this.closeConnection();
        //}
        // TODO: Alert user to termination?
    }

    private async getFromCache<K extends CachedSchemaKeys, T extends CachedBase<K>>(
        tableName: K,
        id: string
    ): Promise<T> {
        if (!this.IsInitialised || !this.dbPromise) {
            return Promise.reject("Not initialised");
        }

        let db = await this.dbPromise;
        let result = await db.get(tableName, id);
        if (result) {
            this.logger.info("Cache hit", {
                conferenceId: this.conferenceId,
                tableName: tableName,
                id: id
            });

            return new Cache.Constructors[tableName](this.conferenceId, result as any) as unknown as T;
        }
        else {
            this.logger.info("Cache miss", {
                conferenceId: this.conferenceId,
                tableName: tableName,
                id: id
            });

            if (this.isUserAuthenticated) {
                let results = await this.fillCache(tableName) as any[];
                const result = results.find(x => x.id === id);
                if (result) {
                    return result;
                }
                else {
                    return Promise.reject(`${id} is not present in ${tableName} cache for conference ${this.conferenceId}`);
                }
            }
            else {
                return Promise.reject(`${id} is not present in ${tableName} cache for conference ${this.conferenceId}`);
            }
        }
    }

    private async getAllFromCache<K extends CachedSchemaKeys, T extends CachedBase<K>>(
        tableName: K,
        filterF?: (x: ExtendedCachedSchema[K]["value"]) => boolean
    ): Promise<Array<T>> {
        if (!this.IsInitialised || !this.dbPromise) {
            return Promise.reject("Not initialised");
        }

        let db = await this.dbPromise;
        let result = await db.getAll(tableName);
        if (result.length !== 0) {
            this.logger.info("Cache get-all hit", {
                conferenceId: this.conferenceId,
                tableName: tableName
            });

            if (filterF) {
                result = result.filter(filterF);
            }

            return result.map(x => {
                return new Cache.Constructors[tableName](this.conferenceId, x as any) as unknown as T;
            });
        }
        else {
            this.logger.info("Cache get-all miss", {
                conferenceId: this.conferenceId,
                tableName: tableName
            });

            if (this.isUserAuthenticated) {
                let results = await this.fillCache<K, T>(tableName);
                if (filterF) {
                    results = results.filter((x: any) => filterF(x.data));
                }
                return results;
            }
            else {
                return [];
            }
        }
    }

    private async newParseQuery<K extends CachedSchemaKeys>(tableName: K) {
        assert(this.isInitialised);
        assert(this.conference);
        let conf = await this.conference;
        assert(conf, "Conference does not exist.");

        let query = new Parse.Query<Parse.Object<PromisesRemapped<CachedSchema[K]["value"]>>>(tableName);
        query.includeAll();
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
        if (!id) {
            return null as any;
        }

        try {
            return await this.getFromCache(tableName, id) as T;
        }
        catch {
            this.logger.warn("Fetch from database of cached item failed", {
                conferenceId: this.conferenceId,
                tableName: tableName,
                id: id,
                reason: "Not present"
            });

            return null;
        }
    }

    async getByField<
        K extends CachedSchemaKeys,
        S extends KnownKeys<LocalDataT[K]>,
        T extends CachedBase<K>
    >(
        tableName: K,
        fieldName: S,
        searchFor: LocalDataT[K][S],
    ): Promise<T | null> {
        // We should do this by defining indexes (within indexeddb) ideally...
        function filterF(current: ExtendedCachedSchema[K]["value"]) {
            if (!(fieldName in current)) {
                return false;
            }

            if (fieldName in RelationsToTableNames[tableName]) {
                if (searchFor instanceof Array) {
                    let _searchFor: Array<any> = searchFor;
                    function match(v: any) {
                        if (current[fieldName as any] instanceof Array) {
                            return current[fieldName as any].includes(v);
                        }
                        else {
                            return v === current[fieldName as any];
                        }
                    }
                    if (_searchFor.some(match)) {
                        return true;
                    }
                }
                else {
                    if (current[fieldName as any] === searchFor) {
                        return true;
                    }
                }
            }
            else {
                if (current[fieldName as any] === searchFor) {
                    return true;
                }
            }
            return false;
        }
        const all: any[] = await this.getAllFromCache(tableName, filterF);
        if (all.length > 0) {
            return all[0];
        }
        return null;
    }

    async getAll<K extends CachedSchemaKeys, T extends CachedBase<K>>(
        tableName: K
    ): Promise<Array<T>> {
        return this.getAllFromCache(tableName);
    }

    async getAllByField<
        K extends CachedSchemaKeys,
        S extends KnownKeys<LocalDataT[K]>,
        T extends CachedBase<K>
    >(
        tableName: K,
        fieldName: S,
        searchFor: LocalDataT[K][S]
    ): Promise<Array<T>> {
        // We should do this by defining indexes (within indexeddb) ideally...
        function filterF(current: ExtendedCachedSchema[K]["value"]): boolean {
            if (!(fieldName in current)) {
                return false;
            }

            if (fieldName in RelationsToTableNames[tableName]) {
                if (searchFor instanceof Array) {
                    let _searchFor: Array<any> = searchFor;
                    function match(v: any) {
                        if (current[fieldName as any] instanceof Array) {
                            return current[fieldName as any].includes(v);
                        }
                        else {
                            return v === current[fieldName as any];
                        }
                    }
                    if (_searchFor.some(match)) {
                        return true;
                    }
                }
                else {
                    if (current[fieldName as any] === searchFor) {
                        return true;
                    }
                }
            }
            else {
                if (current[fieldName as any] === searchFor) {
                    return true;
                }
            }
            return false;
        }
        return await this.getAllFromCache(tableName, filterF);
    }

    async getAllByFilter<
        K extends CachedSchemaKeys,
        T extends CachedBase<K>
    >(
        tableName: K,
        filterF: (current: ExtendedCachedSchema[K]["value"]) => boolean
    ): Promise<Array<T>> {
        return await this.getAllFromCache(tableName, filterF);
    }
}
