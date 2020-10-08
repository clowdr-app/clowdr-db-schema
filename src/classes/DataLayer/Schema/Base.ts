export type ACLSchema = {
    permissionsById: {
        [k: string]: {
            read?: boolean;
            write?: boolean
        }
    }
}

export default interface Base {
    id: string;
    createdAt: Date;
    updatedAt: Date;

    acl: ACLSchema;
}
