import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';
import { ReserveModule } from './reserve/reserve.module';

@Module({
  imports: [
    // 数据库配置（替换为MySQL，适配NestJS最新版+TypeORM最新版，关键修改处）
    TypeOrmModule.forRoot({
      type: 'mysql', // 数据库类型：mysql（替换原sqlite）
      host: 'localhost', // 数据库地址，本地默认localhost
      port: 3306, // MySQL默认端口，无需修改（和安装时一致）
      username: 'root', // MySQL用户名，默认root
      password: '123456', // 安装MySQL时设置的root密码（替换成你自己的密码）
      database: 'meeting_room', // 之前创建的数据库名，固定不变
      autoLoadEntities: true, // 最新版保留该配置，自动加载实体
      synchronize: true, // 开发环境自动创建数据库表，无需手动写SQL（最新版兼容）
      charset: 'utf8mb4', // 字符集，避免中文乱码（最新版推荐配置）
      logging: false, // 新增：最新版可选配置，关闭SQL日志，减少终端冗余输出
    }),
    RoomModule, // 会议室模块
    UserModule, // 用户模块
    ReserveModule, // 新增：注册预定模块
  ],
  controllers: [], // 最新版可显式声明，无额外控制器可留空（避免语法警告）
  providers: [], // 最新版可显式声明，无额外服务可留空（避免语法警告）
})
export class AppModule {}
