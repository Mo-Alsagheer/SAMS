import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Committee } from '../../committees/entities/committee.entity';
import { Session } from '../../sessions/entities/session.entity';
import { User } from '../../users/entities/user.entity';

/** One row per member per session; the same user may have many rows across sessions. */
@Entity('attendance')
@Unique(['sessionId', 'userId'])
export class Attendace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  sessionId: string;

  @ManyToOne(() => Session, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  @Column({ type: 'text' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /** Committee this session belongs to (via roadmap), for filtering attendance by committee. */
  @Column({ type: 'text' })
  committeeId: string;

  @ManyToOne(() => Committee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'committeeId' })
  committee: Committee;

  @Column({ type: 'boolean', default: false })
  attended: boolean;
}
