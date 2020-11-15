import { KnownKeys, PromisedKeys } from "../Util";
import CachedSchema from "./CachedSchema";
import UncachedSchema from "./UncachedSchema";
import { default as SchemaBase } from "./Schema/Base";

export type CachedSchemaKeys = KnownKeys<CachedSchema>;
export type UncachedSchemaKeys = KnownKeys<UncachedSchema>;
export type WholeSchemaKeys = KnownKeys<RelationsToTableNamesT>;
export type WholeSchema = CachedSchema & UncachedSchema;

export type RelationsToTableNamesT =
    {
        [K in CachedSchemaKeys]: {
            [K2 in PromisedKeys<CachedSchema[K]["value"]>]:
            CachedSchema[K]["value"][K2] extends Promise<any> ? WholeSchemaKeys : never
        }
    } & {
        [K in UncachedSchemaKeys]: {
            [K2 in PromisedKeys<UncachedSchema[K]["value"]>]:
            UncachedSchema[K]["value"][K2] extends Promise<any> ? WholeSchemaKeys : never
        }
    };

/**
 * When retrieving fields from Parse objects that are actually related tables,
 * we don't get back a `Promise<Table>`, we get back a
 * `Parse.Object<Schema.Table>`. So this type transformer remaps fields of type
 * `Promise<Interface<K,_>>` to `Parse.Object<Schema[K]>`.
 *
 * (Note: The `code` / `types` used in this comment are intuitive not accurate.)
 */
export type PromisesRemapped<T>
    = { [K in keyof T]: T[K] extends Promise<infer S>
        ? (S extends Array<IBase<infer K2>>
            ? Parse.Object<Array<PromisesRemapped<WholeSchema[K2]["value"]>>>
            : (S extends IBase<infer K2>
                ? Parse.Object<PromisesRemapped<WholeSchema[K2]["value"]>>
                : never))
        : T[K]
    };

/**
 * Remember to update the copy in initTestDB.js when modifying this.
 * This copy is type-checked, so should be treated as the root of truth.
 */
export const RelationsToTableNames: RelationsToTableNamesT = {
    Analytics: {
        conference: "Conference"
    },
    AttachmentType: {
        conference: "Conference"
    },
    AuditLog: {
        conference: "Conference",
        actor: "UserProfile"
    },
    Conference: {
    },
    ConferenceConfiguration: {
        conference: "Conference"
    },
    Errors: {
        conference: "Conference",
        user: "_User"
    },
    Flair: {
        conference: "Conference"
    },
    PrivilegedConferenceDetails: {
        conference: "Conference"
    },
    ProgramItem: {
        conference: "Conference",
        track: "ProgramTrack",
        feed: "ContentFeed",
    },
    ProgramItemAttachment: {
        attachmentType: "AttachmentType",
        conference: "Conference",
        programItem: "ProgramItem"
    },
    ProgramPerson: {
        conference: "Conference",
        profile: "UserProfile",
    },
    ContentFeed: {
        conference: "Conference",
        zoomRoom: "ZoomRoom",
        textChat: "TextChat",
        videoRoom: "VideoRoom",
        youtube: "YouTubeFeed",
    },
    ProgramSession: {
        conference: "Conference",
        track: "ProgramTrack",
        feed: "ContentFeed"
    },
    ProgramSessionEvent: {
        conference: "Conference",
        feed: "ContentFeed",
        item: "ProgramItem",
        session: "ProgramSession",
    },
    ProgramTrack: {
        conference: "Conference",
        feed: "ContentFeed",
    },
    Registration: {
        conference: "Conference",
    },
    Sponsor: {
        conference: "Conference",
        videoRoom: "VideoRoom"
    },
    SponsorContent: {
        conference: "Conference",
        sponsor: "Sponsor"
    },
    _Role: {
        conference: "Conference",
        users: "_User",
        roles: "_Role"
    },
    _User: {
        profiles: "UserProfile"
    },
    UserProfile: {
        conference: "Conference",
        primaryFlair: "Flair",
        user: "_User",
        watched: "WatchedItems"
    },
    ZoomRoom: {
        conference: "Conference",
    },
    TextChat: {
        conference: "Conference",
        creator: "UserProfile"
    },
    TextChatMessage: {
        chat: "TextChat"
    },
    VideoRoom: {
        conference: "Conference",
        textChat: "TextChat",
    },
    YouTubeFeed: {
        conference: "Conference"
    },
    WatchedItems: {
        conference: "Conference"
    }
};

export interface IBase<K extends WholeSchemaKeys> extends SchemaBase {
    getUncachedParseObject(): Promise<Parse.Object<PromisesRemapped<WholeSchema[K]["value"]>>>;
}
