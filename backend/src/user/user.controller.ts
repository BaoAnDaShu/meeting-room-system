import { Controller, Post, Body, Get, Param, NotFoundException, BadRequestException, Delete, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users') // 接口前缀：所有用户相关接口以 /users 开头
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 接口1：用户注册（POST请求，前端提交用户名密码）
  // 注意：公开注册只允许普通用户，管理员必须通过其他方式创建
  @Post('register')
  async register(@Body() userData: CreateUserDto): Promise<User> {
    // 强制将角色设为普通用户，防止恶意注册管理员
    if (userData.role === '管理员') {
      throw new BadRequestException('不允许自行注册管理员账号');
    }
    // 确保角色为普通用户
    userData.role = '普通用户';
    return this.userService.register(userData);
  }

  // 接口2：用户登录（POST请求，前端提交用户名密码）
  @Post('login')
  async login(@Body() loginData: LoginUserDto): Promise<User> {
    return this.userService.login(loginData.username, loginData.password);
  }

  // 接口3：获取所有用户（管理后台用）
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  // 接口4：根据用户ID获取用户（后续预定功能关联用）
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    return user;
  }

  // 接口5：创建用户（管理后台用，允许创建管理员）
  @Post()
  async create(@Body() userData: CreateUserDto): Promise<User> {
    return this.userService.register(userData);
  }

  // 接口6：更新用户（管理后台用）
  @Put(':id')
  async update(@Param('id') id: string, @Body() userData: UpdateUserDto): Promise<User> {
    return this.userService.update(+id, userData);
  }

  // 接口7：删除用户（管理后台用）
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.delete(+id);
  }
}
