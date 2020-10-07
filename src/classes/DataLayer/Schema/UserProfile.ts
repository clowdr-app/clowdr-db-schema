import { Base } from ".";
import { _User, Conference, Flair, WatchedItems } from "../Interface";
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
    webpage: string | undefined;
    welcomeModalShown: boolean;

    conference: Promise<Conference>;
    primaryFlair: Promise<Flair | undefined>;
    user: Promise<_User>;
    watched: Promise<WatchedItems>;
}
