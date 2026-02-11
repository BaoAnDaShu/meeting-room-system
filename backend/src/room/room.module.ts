import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Room])], // 注册会议室实体（MySQL自动创建表）
  providers: [RoomService], // 注册会议室服务（业务逻辑）
  controllers: [RoomController], // 注册会议室控制器（接口）
  exports: [RoomService], // 导出会议室服务，供其他模块使用
})
export class RoomModule {}
