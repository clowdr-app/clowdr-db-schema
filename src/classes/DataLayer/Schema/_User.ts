import { Base } from ".";

export default interface Schema extends Base {
    authData: object;
    email: string;
    emailVerified: boolean;
    passwordResetToken: string | undefined;
    passwordSet: boolean;
    username: string;
}
