import { Base } from ".";
import { _User, Conference, Flair } from "../Interface";
import Parse from "parse";

// This is embedded in UserProfile and is not itself a table in the DB
export interface UserProfileTag {
    alwaysShow: boolean;
    label: string;
    priority: number;
    tooltip: string;
}

export default interface Schema extends Base {
    affiliation: string | undefined;
    bio: string | undefined;
    country: string | undefined;
    dataConsentGiven: boolean;
    displayName: string;
    flairs: Array<string>;
    position: string | undefined;
    profilePhoto: Parse.File | undefined;
    pronouns: Array<string>;
    realName: string;
    tags: Array<UserProfileTag>;
    watchedEvents: Array<string> | undefined;
    watchedSessions: Array<string> | undefined;
    watchedTextChats: Array<string> | undefined;
    watchedTracks: Array<string> | undefined;
    watchedVideoRooms: Array<string> | undefined;
    webpage: string | undefined;
    welcomeModalShown: boolean;

    conference: Promise<Conference>;
    primaryFlair: Promise<Flair | undefined>;
    user: Promise<_User>;
}
