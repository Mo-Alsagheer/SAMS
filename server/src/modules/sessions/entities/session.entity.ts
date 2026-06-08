import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  roadmapId: number | null;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'text', nullable: true })
  plugnmeetRoomId: string | null;

  @Column({ type: 'boolean', default: false })
  isRecorded: boolean;

  @Column({ type: 'int', nullable: true })
  committeeId: number | null;

  @Column({ type: 'int', nullable: true })
  creatorId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
