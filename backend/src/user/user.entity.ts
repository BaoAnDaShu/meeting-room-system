import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// 用户表（MySQL自动创建，存储登录用户信息）
@Entity()
export class User {
  @PrimaryGeneratedColumn() // 用户ID，自动增长
  id: number;

  @Column({ unique: true }) // 用户名，唯一（不能重复注册）
  username: string;

  @Column() // 用户密码（简单存储，开发环境可用，后续可优化加密）
  password: string;

  @Column({ default: '普通用户' }) // 用户角色，默认普通用户
  role: string;
}
