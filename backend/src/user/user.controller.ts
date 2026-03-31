import { Controller, Post, Body, Get, Param, NotFoundException, BadRequestException, Delete, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permissions } from '../auth/permissions.decorator';
import { Permission } from '../auth/permissions.enum';
import { PermissionsGuard } from '../auth/permissions.guard';

@Controller('users') // 接口前缀：所有用户相关接口以 /users 开头
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 接口1：用户注册（POST请求，前端提交用户名密码）
  // 注意：公开注册只允许普通用户，不需要权限验证
  @Post('register')
  async register(@Body() userData: CreateUserDto): Promise<User> {
    // 强制将角色设为普通用户，防止恶意注册管理员
    // 使用英文角色名与权限系统保持一致
    userData.role = 'user';
    return this.userService.register(userData);
  }

  // 接口2：用户登录（POST请求，前端提交用户名密码）
  // 不需要权限验证
  @Post('login')
  async login(@Body() loginData: LoginUserDto): Promise<User> {
    return this.userService.login(loginData.username, loginData.password);
  }

  // 接口3：获取所有用户（管理后台用）
  // 权限：需要 USER_VIEW 或 USER_MANAGE 权限
  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.USER_VIEW, Permission.USER_MANAGE)
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  // 接口4：根据用户ID获取用户（后续预定功能关联用）
  // 公开接口，不需要权限验证
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    return user;
  }

  // 接口5：创建用户（管理后台用，允许创建管理员）
  // 权限：需要 USER_CREATE 或 USER_MANAGE 权限
  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.USER_CREATE, Permission.USER_MANAGE)
  async create(@Body() userData: CreateUserDto): Promise<User> {
    return this.userService.register(userData);
  }

  // 接口6：更新用户（管理后台用）
  // 权限：需要 USER_EDIT 或 USER_MANAGE 权限
  @Put(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.USER_EDIT, Permission.USER_MANAGE)
  async update(@Param('id') id: string, @Body() userData: UpdateUserDto): Promise<User> {
    return this.userService.update(+id, userData);
  }

  // 接口7：删除用户（管理后台用）
  // 权限：需要 USER_DELETE 或 USER_MANAGE 权限
  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.USER_DELETE, Permission.USER_MANAGE)
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.delete(+id);
  }
}
