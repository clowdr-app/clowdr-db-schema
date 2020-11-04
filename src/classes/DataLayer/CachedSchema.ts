import IDB from 'idb';

import * as Schema from "./Schema";
import { PromisedKeys } from "../Util";
import Base from './Schema/Base';
import { Conference } from './Interface';

// Note: IndexedDB is very limited - it can only handle 1-to-N indexes

export type Indexes<T> = { [K in PromisedKeys<T>]: "id" };


// IMPORTANT: Whenever changes are made to the schema, the version number should
//            be increased.

// Decimal places are not allowed - only positive integers!
export const SchemaVersion: number = 10;

export interface CachableDBSchema extends IDB.DBSchema {
    [s: string]: DBSchemaValue;
}
interface IndexKeys {
    [s: string]: IDBValidKey;
}
interface DBSchemaValue {
    key: IDBValidKey;
    value: Base;
    indexes?: IndexKeys;
}

export default interface CachedSchema extends CachableDBSchema {
    AttachmentType: {
        key: string;
        value: Schema.AttachmentType;
        indexes: Indexes<Schema.AttachmentType>;
    };
    Conference: {
        key: string;
        value: Schema.Conference;
        indexes: Indexes<Schema.Conference>;
    };
    ConferenceConfiguration: {
        key: string;
        value: Schema.ConferenceConfiguration;
        indexes: Indexes<Schema.ConferenceConfiguration>;
    };
    ContentFeed: {
        key: string;
        value: Schema.ContentFeed;
        indexes: Indexes<Schema.ContentFeed>;
    };
    Flair: {
        key: string;
        value: Schema.Flair;
        indexes: Indexes<Schema.Flair>;
    };
    PrivilegedConferenceDetails: {
        key: string;
        value: Schema.PrivilegedConferenceDetails;
        indexes: Indexes<Schema.PrivilegedConferenceDetails>;
    };
    ProgramPerson: {
        key: string;
        value: Schema.ProgramPerson;
        indexes: Indexes<Schema.ProgramPerson>;
    };
    ProgramItem: {
        key: string;
        value: Schema.ProgramItem;
        indexes: Indexes<Schema.ProgramItem>;
    };
    ProgramItemAttachment: {
        key: string;
        value: Schema.ProgramItemAttachment;
        indexes: Indexes<Schema.ProgramItemAttachment>;
    };
    ProgramSession: {
        key: string;
        value: Schema.ProgramSession;
        indexes: Indexes<Schema.ProgramSession>;
    };
    ProgramSessionEvent: {
        key: string;
        value: Schema.ProgramSessionEvent;
        indexes: Indexes<Schema.ProgramSessionEvent>;
    };
    ProgramTrack: {
        key: string;
        value: Schema.ProgramTrack;
        indexes: Indexes<Schema.ProgramTrack>;
    };
    Sponsor: {
        key: string;
        value: Schema.Sponsor;
        indexes: Indexes<Schema.Sponsor>;
    };
    SponsorContent: {
        key: string;
        value: Schema.SponsorContent;
        indexes: Indexes<Schema.SponsorContent>;
    };
    TextChat: {
        key: string;
        value: Schema.TextChat;
        indexes: Indexes<Schema.TextChat>;
    };
    TextChatMessage: {
        key: string;
        value: Schema.TextChatMessage;
        indexes: Indexes<Schema.TextChatMessage>;
    };
    UserProfile: {
        key: string;
        value: Schema.UserProfile;
        indexes: Indexes<Schema.UserProfile>;
    };
    VideoRoom: {
        key: string;
        value: Schema.VideoRoom;
        indexes: Indexes<Schema.VideoRoom>;
    };
    WatchedItems: {
        key: string;
        value: Schema.WatchedItems;
        indexes: Indexes<Schema.WatchedItems>;
    };
    YouTubeFeed: {
        key: string;
        value: Schema.YouTubeFeed;
        indexes: Indexes<Schema.YouTubeFeed>;
    }
    ZoomRoom: {
        key: string;
        value: Schema.ZoomRoom;
        indexes: Indexes<Schema.ZoomRoom>;
    };
}
