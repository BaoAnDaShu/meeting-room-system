import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';

// 预定记录表（关联用户和会议室，存储预定信息）
@Entity()
export class Reserve {
  @PrimaryGeneratedColumn() // 预定ID，自动增长
  id: number;

  @Column() // 预定日期（格式：YYYY-MM-DD，比如2026-02-12）
  reserveDate: string;

  @Column() // 预定时间段（格式：HH:mm-HH:mm，比如09:00-10:00）
  timeSlot: string;

  @Column({ default: '正常' }) // 预定状态：正常/已取消
  status: string;

  @Column() // 关联用户ID（哪个用户预定的）
  userId: number;

  @Column() // 关联会议室ID（预定的哪个会议室）
  roomId: number;

  // 关联用户表（多对一：多个预定记录属于一个用户）
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  // 关联会议室表（多对一：多个预定记录属于一个会议室）
  @ManyToOne(() => Room, (room) => room.id)
  @JoinColumn({ name: 'roomId' })
  room: Room;
}
