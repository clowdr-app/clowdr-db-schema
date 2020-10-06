import IDB from 'idb';

import * as Schema from "./Schema";
import { Indexes } from './CachedSchema';

export default interface UncachedSchema extends IDB.DBSchema {
    Registration: {
        key: string;
        value: Schema.Registration;
        indexes: Indexes<Schema.Registration>;
    };
    _Role: {
        key: string;
        value: Schema._Role;
        indexes: Indexes<Schema._Role>;
    };
    _User: {
        key: string;
        value: Schema._User;
        indexes: Indexes<Schema._User>;
    };
}
