import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserInitService } from './user-init.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // 注册用户实体（MySQL自动创建user表）
  providers: [UserService, UserInitService], // 注册用户服务和初始化服务
  controllers: [UserController], // 注册用户控制器
  exports: [UserService], // 导出用户服务，供其他模块使用
})
export class UserModule {}
