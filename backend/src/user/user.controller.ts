import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users') // 接口前缀：所有用户相关接口以 /users 开头
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 接口1：用户注册（POST请求，前端提交用户名密码）
  @Post('register')
  async register(@Body() userData: Partial<User>): Promise<User> {
    // 简单校验：确保用户名和密码不为空
    if (!userData.username || !userData.password) {
      throw new Error('用户名和密码不能为空');
    }
    return this.userService.register(userData);
  }

  // 接口2：用户登录（POST请求，前端提交用户名密码）
  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ): Promise<User> {
    return this.userService.login(username, password);
  }

  // 接口3：根据用户ID获取用户（后续预定功能关联用）
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    return user;
  }
}
