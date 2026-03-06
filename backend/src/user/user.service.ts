import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
    // 对密码进行加密
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password!, saltRounds);
    // 创建并保存用户（使用加密后的密码）
    const userDataWithHashedPassword: Partial<User> = {
      ...userData,
      password: hashedPassword,
    };
    const user = this.userRepository.create(userDataWithHashedPassword);
    const savedUsers = await this.userRepository.save(user);
    return Array.isArray(savedUsers) ? savedUsers[0] : savedUsers;
  }

  // 2. 用户登录（校验用户名密码，返回用户信息）
  async login(username: string, password: string): Promise<User> {
    // 查找用户
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`用户名 ${username} 不存在`);
    }
    // 校验密码（使用 bcrypt 比较）
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }
    return user; // 返回用户信息（前端存储，用于后续关联预定记录）
  }

  // 3. 根据用户ID获取用户（后续预定功能关联用户用）
  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // 4. 获取所有用户（管理后台用）
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // 5. 更新用户（管理后台用）
  async update(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    // 如果提供了密码，需要加密
    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    // 更新用户信息
    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  // 6. 删除用户（管理后台用）
  async delete(id: number): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    await this.userRepository.delete(id);
  }
}
