import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserve } from './reserve.entity';
import { ReserveService } from './reserve.service';
import { ReserveController } from './reserve.controller';
import { RoomModule } from '../room/room.module'; // 引入会议室模块（依赖）
import { UserModule } from '../user/user.module'; // 引入用户模块（依赖）

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserve]), // 注册预定实体（MySQL自动创建reserve表）
    RoomModule, // 依赖会议室模块（修改会议室状态）
    UserModule, // 依赖用户模块（校验用户）
  ],
  providers: [ReserveService], // 注册预定服务
  controllers: [ReserveController], // 注册预定控制器
})
export class ReserveModule {}