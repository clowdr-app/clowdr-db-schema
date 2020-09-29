import { Base } from ".";
import { AttachmentType, Conference, ProgramItem } from "../Interface";
import Parse from "parse";

export default interface Schema extends Base {
    file: Parse.File | undefined;
    url: string | undefined;

    attachmentType: Promise<AttachmentType>;
    conference: Promise<Conference>;
    programItem: Promise<ProgramItem>;
}
