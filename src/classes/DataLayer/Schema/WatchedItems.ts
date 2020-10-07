import { Base } from ".";
import { Conference } from "../Interface";

export default interface Schema extends Base {
    watchedChats: Array<string>;
    watchedEvents: Array<string>;
    watchedRooms: Array<string>;
    watchedSessions: Array<string>;
    watchedTracks: Array<string>;

    conference: Promise<Conference>;
}
