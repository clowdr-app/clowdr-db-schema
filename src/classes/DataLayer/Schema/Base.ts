export type ACLSchema = {
    permissionsById: { [k: string]: any }
}

export default interface Base {
    id: string;
    createdAt: Date;
    updatedAt: Date;

    acl: ACLSchema;
}
