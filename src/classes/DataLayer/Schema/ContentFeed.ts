import { Base } from ".";
import { Conference, TextChat, VideoRoom, YouTubeFeed, ZoomRoom } from "../Interface";

export default interface Schema extends Base {
    name: string;
    originatingID: string | undefined;

    conference: Promise<Conference>;
    textChat: Promise<TextChat | undefined>;
    videoRoom: Promise<VideoRoom | undefined>;
    youtube: Promise<YouTubeFeed | undefined>;
    zoomRoom: Promise<ZoomRoom | undefined>;
}
