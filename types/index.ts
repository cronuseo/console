export interface Resource {
    id: string;
    identifier: string;
    display_name: string;
    type: string;
    actions?: (ActionEntity)[] | null;
}

export interface User {
    id: string;
    username: string;
    identifier: string;
    roles?: RoleEntity[];
    groups?: GroupEntity[]
    user_properties?: object | null;
}

export interface Role {
    id: string;
    identifier: string;
    display_name: string;
    users?: (UserEntity)[] | null;
    groups?: (GroupEntity)[] | null;
    permissions?: (PermissionEntity)[] | null;
}
export interface UserEntity {
    id: string;
    username: string;
    identifier: string;
}
export interface PermissionEntity {
    action: string;
    resource: string;
}

export interface RoleEntity {
    id: string;
    identifier: string;
    display_name: string;
}

export interface GroupEntity {
    id: string;
    identifier: string;
    display_name: string;
}

export interface ResourceEntity {
    id: string;
    identifier: string;
    display_name: string;
    type: string;
}

export interface ActionEntity {
    id: string;
    identifier: string;
    display_name: string;
}

