import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, hasAnyPermission } from './permissions.enum';

// 权限守卫 - 检查用户是否有权限访问接口
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取接口需要的权限
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有设置权限要求，允许访问
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 获取当前请求
    const request = context.switchToHttp().getRequest();
    
    // 从请求头或查询参数中获取用户信息（简化实现）
    // 实际项目中应该使用 JWT token 验证
    // 注意：HTTP 头在 Node.js 中会被转换为小写
    // 前端对中文角色名进行了 encodeURIComponent，这里需要解码
    const encodedRole = request.headers['x-user-role'] || request.query.userRole;
    const userRole = encodedRole ? decodeURIComponent(encodedRole as string) : null;
    
    // 如果没有用户信息，拒绝访问
    if (!userRole) {
      throw new ForbiddenException('无法获取用户信息，请先登录');
    }

    // 检查用户是否有任意一个所需权限
    const hasPermission = hasAnyPermission(userRole as string, requiredPermissions);

    if (!hasPermission) {
      throw new ForbiddenException('您没有权限执行此操作');
    }

    return true;
  }
}
