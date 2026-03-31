// 权限枚举 - 定义系统中所有的权限
export enum Permission {
  // 会议室权限
  ROOM_VIEW = 'room:view',           // 查看会议室列表
  ROOM_CREATE = 'room:create',       // 添加会议室
  ROOM_EDIT = 'room:edit',           // 编辑会议室
  ROOM_DELETE = 'room:delete',       // 删除会议室
  ROOM_MANAGE = 'room:manage',       // 管理会议室（包含增删改）

  // 预定权限
  RESERVE_CREATE = 'reserve:create',           // 创建预定
  RESERVE_CANCEL_SELF = 'reserve:cancel:self', // 取消自己的预定
  RESERVE_CANCEL_ALL = 'reserve:cancel:all',   // 取消所有预定（管理员）
  RESERVE_VIEW_SELF = 'reserve:view:self',     // 查看自己的预定
  RESERVE_VIEW_ALL = 'reserve:view:all',       // 查看所有预定（管理员）
  RESERVE_APPROVE = 'reserve:approve',         // 审批预定

  // 用户权限
  USER_VIEW = 'user:view',           // 查看用户列表
  USER_CREATE = 'user:create',       // 创建用户
  USER_EDIT = 'user:edit',           // 编辑用户
  USER_DELETE = 'user:delete',       // 删除用户
  USER_MANAGE = 'user:manage',       // 管理用户（包含增删改）

  // 系统权限
  SYSTEM_ADMIN = 'system:admin',     // 系统管理员（所有权限）
}

// 角色权限映射 - 定义每个角色拥有哪些权限
export const RolePermissions: Record<string, Permission[]> = {
  // 超级管理员 - 拥有所有权限
  admin: [
    Permission.SYSTEM_ADMIN,
    Permission.ROOM_VIEW,
    Permission.ROOM_CREATE,
    Permission.ROOM_EDIT,
    Permission.ROOM_DELETE,
    Permission.ROOM_MANAGE,
    Permission.RESERVE_CREATE,
    Permission.RESERVE_CANCEL_SELF,
    Permission.RESERVE_CANCEL_ALL,
    Permission.RESERVE_VIEW_SELF,
    Permission.RESERVE_VIEW_ALL,
    Permission.RESERVE_APPROVE,
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_EDIT,
    Permission.USER_DELETE,
    Permission.USER_MANAGE,
  ],

  // 会议室管理员 - 管理会议室和预定
  roomManager: [
    Permission.ROOM_VIEW,
    Permission.ROOM_CREATE,
    Permission.ROOM_EDIT,
    Permission.ROOM_DELETE,
    Permission.ROOM_MANAGE,
    Permission.RESERVE_CREATE,
    Permission.RESERVE_CANCEL_SELF,
    Permission.RESERVE_CANCEL_ALL,
    Permission.RESERVE_VIEW_SELF,
    Permission.RESERVE_VIEW_ALL,
    Permission.RESERVE_APPROVE,
    Permission.USER_VIEW,
  ],

  // 普通用户 - 只能预定和查看
  user: [
    Permission.ROOM_VIEW,
    Permission.RESERVE_CREATE,
    Permission.RESERVE_CANCEL_SELF,
    Permission.RESERVE_VIEW_SELF,
  ],

  // 访客 - 只读权限
  guest: [
    Permission.ROOM_VIEW,
    Permission.RESERVE_VIEW_SELF,
  ],
};

// 检查用户是否有指定权限
export function hasPermission(userRole: string, permission: Permission): boolean {
  const permissions = RolePermissions[userRole] || [];
  return permissions.includes(permission) || permissions.includes(Permission.SYSTEM_ADMIN);
}

// 检查用户是否有任意一个指定权限
export function hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// 检查用户是否拥有所有指定权限
export function hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}
