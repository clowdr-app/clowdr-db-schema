import * as Schema from "../Schema";
import { PromisesRemapped } from "../WholeSchema";
import { StaticCachedBase, StaticBaseImpl, LocalDataT, CachedBase } from "./Base";
import { Conference, Flair, ProgramPerson, ProgramSession, ProgramSessionEvent, ProgramTrack, TextChat, VideoRoom, WatchedItems, _User } from ".";
import { removeNull } from "../../Util";

type SchemaT = Schema.UserProfile;
type K = "UserProfile";
const K_str: K = "UserProfile";

export default class Class extends CachedBase<K> implements SchemaT {
    constructor(
        conferenceId: string,
        data: LocalDataT[K],
        parse: Parse.Object<PromisesRemapped<SchemaT>> | null = null) {
        super(conferenceId, K_str, data, parse);
    }
    
    get isBanned(): boolean {
        return this.data.isBanned;
    }

    get affiliation(): string | undefined {
        return this.data.affiliation;
    }

    set affiliation(value) {
        this.data.affiliation = value;
    }

    get bio(): string | undefined {
        return this.data.bio;
    }

    set bio(value) {
        this.data.bio = value;
    }

    get country(): string | undefined {
        return this.data.country;
    }

    set country(value) {
        this.data.country = value;
    }

    get displayName(): string {
        return this.data.displayName;
    }

    set displayName(value) {
        this.data.displayName = value;
    }

    get position(): string | undefined {
        return this.data.position;
    }

    set position(value) {
        this.data.position = value;
    }

    get profilePhoto(): Parse.File | undefined {
        return this.data.profilePhoto;
    }

    set profilePhoto(value) {
        this.data.profilePhoto = value;
    }

    get pronouns(): Array<string> {
        return this.data.pronouns;
    }

    set pronouns(value) {
        this.data.pronouns = value;
    }

    get realName(): string {
        return this.data.realName;
    }

    set realName(value) {
        this.data.realName = value;
    }

    get dataConsentGiven(): boolean {
        return this.data.dataConsentGiven;
    }

    set dataConsentGiven(value) {
        this.data.dataConsentGiven = value;
    }

    get tags(): Schema.UserProfileTag[] {
        return this.data.tags;
    }

    set tags(value) {
        this.data.tags = value;
    }

    get webpage(): string | undefined {
        return this.data.webpage;
    }

    set webpage(value) {
        this.data.webpage = value;
    }

    get welcomeModalShown(): boolean {
        return this.data.welcomeModalShown;
    }

    set welcomeModalShown(value) {
        this.data.welcomeModalShown = value;
    }

    get conference(): Promise<Conference> {
        return this.uniqueRelated("conference");
    }

    get primaryFlair(): Promise<Flair | undefined> {
        return this.uniqueRelated("primaryFlair");
    }
    
    get primaryFlairId(): string | undefined {
        return this.data.primaryFlair;
    }

    set primaryFlairId(value) {
        this.data.primaryFlair = value;
    }

    get firstLogin(): Date | undefined {
        return this.data.firstLogin;
    }
    
    set firstLogin(value: Date | undefined) {
        this.data.firstLogin = value;
    }

    get programPersons(): Promise<ProgramPerson[]> {
        return StaticBaseImpl.getAllByField("ProgramPerson", "profile", this.id, this.conferenceId);
    }

    get watched(): Promise<WatchedItems> {
        return this.uniqueRelated("watched");
    }
    
    get watchedId(): string {
        return this.data.watched;
    }

    get user(): Promise<_User> {
        return this.uniqueRelated("user");
    }

    /**
     * `_User` table is protected by ACLs, so attendees cannot use `UserProfile.userId`
     * for anyone but themselves.
     */
    get userId(): string {
        return this.data.user;
    }

    get flairs(): string[] {
        return this.data.flairs;
    }

    set flairs(value) {
        this.data.flairs = value;
    }

    get flairObjects(): Promise<Flair[]> {
        return Promise.all(this.data.flairs.map(x => Flair.get(x, this.conferenceId))).then(xs => removeNull(xs));
    }

    static getByUserId(userId: string, conferenceId: string): Promise<Class | null> {
        return StaticBaseImpl.getByField("UserProfile", "user", userId, conferenceId, false);
    }

    static get(id: string, conferenceId: string): Promise<Class | null> {
        return StaticBaseImpl.get(K_str, id, conferenceId);
    }

    static getAll(conferenceId: string): Promise<Array<Class>> {
        return StaticBaseImpl.getAll(K_str, conferenceId);
    }

    static onDataUpdated(conferenceId: string) {
        return StaticBaseImpl.onDataUpdated(K_str, conferenceId);
    }

    static onDataDeleted(conferenceId: string) {
        return StaticBaseImpl.onDataDeleted(K_str, conferenceId);
    }
}

// The line of code below triggers type-checking of Class for static members
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _: StaticCachedBase<K> = Class;
