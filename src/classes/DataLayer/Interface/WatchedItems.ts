import { Conference, ProgramSession, ProgramSessionEvent, ProgramTrack, TextChat, VideoRoom } from ".";
import { removeNull } from "../../Util";
import * as Schema from "../Schema";
import { PromisesRemapped } from "../WholeSchema";
import { StaticCachedBase, StaticBaseImpl, LocalDataT, CachedBase } from "./Base";

type SchemaT = Schema.WatchedItems;
type K = "WatchedItems";
const K_str: K = "WatchedItems";

export default class Class extends CachedBase<K> implements SchemaT {
    constructor(
        conferenceId: string,
        data: LocalDataT[K],
        parse: Parse.Object<PromisesRemapped<SchemaT>> | null = null) {
        super(conferenceId, K_str, data, parse);
    }

    get watchedEvents(): string[] {
        return this.data.watchedEvents;
    }

    get watchedEventObjects(): Promise<Array<ProgramSessionEvent>> {
        return Promise.all(this.data.watchedEvents.map(id => ProgramSessionEvent.get(id, this.conferenceId)) ?? []).then(removeNull);
    }

    set watchedEvents(value) {
        this.data.watchedEvents = value;
    }

    get watchedSessions(): string[] {
        return this.data.watchedSessions;
    }

    get watchedSessionObjects(): Promise<Array<ProgramSession>> {
        return Promise.all(this.data.watchedSessions.map(id => ProgramSession.get(id, this.conferenceId)) ?? []).then(removeNull);
    }

    set watchedSessions(value) {
        this.data.watchedSessions = value;
    }

    get watchedChats(): string[] {
        return this.data.watchedChats;
    }

    get watchedChatObjects(): Promise<Array<TextChat>> {
        return Promise.all(this.data.watchedChats.map(id => TextChat.get(id, this.conferenceId))).then(removeNull);
    }

    set watchedChats(value) {
        this.data.watchedChats = value;
    }

    get watchedTracks(): string[] {
        return this.data.watchedTracks;
    }

    get watchedTrackObjects(): Promise<Array<ProgramTrack>> {
        return Promise.all(this.data.watchedTracks.map(id => ProgramTrack.get(id, this.conferenceId)) ?? []).then(removeNull);
    }

    set watchedTracks(value) {
        this.data.watchedTracks = value;
    }

    get watchedRooms(): string[] {
        return this.data.watchedRooms;
    }

    get watchedRoomObjects(): Promise<Array<VideoRoom>> {
        return Promise.all(this.data.watchedRooms.map(id => VideoRoom.get(id, this.conferenceId)) ?? []).then(removeNull);
    }

    set watchedRooms(value) {
        this.data.watchedRooms = value;
    }


    get conference(): Promise<Conference> {
        return this.uniqueRelated("conference");
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
