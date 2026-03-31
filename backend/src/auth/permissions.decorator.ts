import { SetMetadata } from '@nestjs/common';
import { Permission } from './permissions.enum';

// 权限装饰器 - 用于标记接口需要的权限
export const PERMISSIONS_KEY = 'permissions';

/**
 * 权限装饰器
 * @param permissions 需要的权限列表，用户只需拥有其中一个即可访问
 * @example
 * @Permissions(Permission.ROOM_CREATE)
 * @Permissions(Permission.ROOM_CREATE, Permission.ROOM_MANAGE)
 */
export const Permissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
