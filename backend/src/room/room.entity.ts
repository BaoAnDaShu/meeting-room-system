import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// 会议室表（数据库自动创建该表）
@Entity()
export class Room {
  @PrimaryGeneratedColumn() // 主键ID，自动增长（比如1、2、3...）
  id: number;

  @Column() // 会议室名称（必填）
  name: string;

  @Column() // 容纳人数（必填）
  capacity: number;

  @Column() // 会议室位置（必填，比如"3楼301"）
  location: string;

  @Column({ default: '可用' }) // 会议室状态，默认"可用"
  status: string;
}
