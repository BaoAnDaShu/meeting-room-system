import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 1. 用户注册（新增用户）
  async register(userData: Partial<User>): Promise<User> {
    // 校验：用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username: userData.username },
    });
    if (existingUser) {
      throw new ConflictException(`用户名 ${userData.username} 已存在`);
    }
    // 创建并保存用户
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  // 2. 用户登录（校验用户名密码，返回用户信息）
  async login(username: string, password: string): Promise<User> {
    // 查找用户
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`用户名 ${username} 不存在`);
    }
    // 校验密码（简单匹配，开发环境可用）
    if (user.password !== password) {
      throw new UnauthorizedException('密码错误');
    }
    return user; // 返回用户信息（前端存储，用于后续关联预定记录）
  }

  // 3. 根据用户ID获取用户（后续预定功能关联用户用）
  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
