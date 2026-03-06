import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';
import { ReserveModule } from './reserve/reserve.module';

@Module({
  imports: [
    // 数据库配置（使用SQLite，无需安装额外数据库软件）
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'meeting_room.db',
      autoLoadEntities: true,
      // 注意：synchronize 在开发环境可以设为 true，生产环境必须设为 false
      // 生产环境应该使用数据库迁移（migrations）来管理表结构变更
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production', // 开发环境开启日志，生产环境关闭
    }),
    RoomModule, // 会议室模块
    UserModule, // 用户模块
    ReserveModule, // 新增：注册预定模块
  ],
  controllers: [], // 最新版可显式声明，无额外控制器可留空（避免语法警告）
  providers: [], // 最新版可显式声明，无额外服务可留空（避免语法警告）
})
export class AppModule {}
