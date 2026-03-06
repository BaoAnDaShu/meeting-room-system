import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UserInitService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // 系统启动时检查是否存在管理员账号，如果不存在则创建默认管理员
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const adminUsername = 'admin';
    
    // 检查是否已存在管理员账号
    const existingAdmin = await this.userRepository.findOne({
      where: { username: adminUsername },
    });

    if (existingAdmin) {
      console.log('✅ 管理员账号已存在，跳过初始化');
      return;
    }

    // 创建默认管理员账号
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    const adminUser = this.userRepository.create({
      username: adminUsername,
      password: hashedPassword,
      role: '管理员',
    });

    await this.userRepository.save(adminUser);
    console.log('✅ 默认管理员账号创建成功');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('   请登录后及时修改默认密码！');
  }
}
