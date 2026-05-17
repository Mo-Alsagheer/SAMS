import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Committee } from '../../committees/entities/committee.entity';
import { Session } from '../../sessions/entities/session.entity';
import { User } from '../../users/entities/user.entity';

/** One row per member per session; attended is set by the director after each session. */
@Entity('attendance')
@Unique(['sessionId', 'userId'])
export class Attendace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  sessionId: number;

  @ManyToOne(() => Session, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  committeeId: number;

  @ManyToOne(() => Committee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'committeeId' })
  committee: Committee;

  /** Legacy column; 5 when attended, 0 when marked absent. Prefer `attended` for scoring. */
  @Column({ type: 'int', nullable: true })
  score: number | null;

  @Column({ type: 'boolean', default: false })
  attended: boolean;

  @Column({ type: 'int', nullable: true })
  createdBy: number | null;

  @Column({ type: 'int', nullable: true })
  updatedBy: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
