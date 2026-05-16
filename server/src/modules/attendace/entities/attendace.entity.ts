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

  @Column({ type: 'boolean', default: false })
  attended: boolean;
}
