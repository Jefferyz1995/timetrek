import useUserStore from '@/store/modules/user';

const authPermission = (permission: string): boolean => {
  const all_permission = '*:*:*';
  const permissions: string[] = useUserStore().permissions;
  if (permission && permission.length > 0) {
    return permissions.some((v) => {
      return all_permission === v || v === permission;
    });
  } else {
    return false;
  }
};

const authRole = (role: string): boolean => {
  const super_admin = 'admin';
  const roles = useUserStore().roles;
  if (role && role.length > 0) {
    return roles.some((v) => {
      return super_admin === v || v === role;
    });
  } else {
    return false;
  }
};

export default {
  // Verify whether the user has certain permissions
  hasPermi(permission: string): boolean {
    return authPermission(permission);
  },
  // Verify whether the user has the specified permissions, only need to include one of them
  hasPermiOr(permissions: string[]): boolean {
    return permissions.some((item) => {
      return authPermission(item);
    });
  },
  // Verify whether the user has the specified permissions, which must all be owned
  hasPermiAnd(permissions: string[]): boolean {
    return permissions.every((item) => {
      return authPermission(item);
    });
  },
  // Verify whether the user has a certain role
  hasRole(role: string): boolean {
    return authRole(role);
  },
  // Verify whether the user has the specified role, only one of them needs to be included
  hasRoleOr(roles: string[]): boolean {
    return roles.some((item) => {
      return authRole(item);
    });
  },
  // Verify whether the user has the specified role, which must all be owned
  hasRoleAnd(roles: string[]): boolean {
    return roles.every((item) => {
      return authRole(item);
    });
  }
};
