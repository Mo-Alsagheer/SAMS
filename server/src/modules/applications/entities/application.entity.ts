import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../../common/constants/role.enum';

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  AI_REVIEWED = 'AI_REVIEWED',
  PHASE1_ACCEPTED = 'PHASE1_ACCEPTED',
  PHASE1_REJECTED = 'PHASE1_REJECTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  PHASE2_ACCEPTED = 'PHASE2_ACCEPTED',
  PHASE2_REJECTED = 'PHASE2_REJECTED',
}

import { User } from '../../users/entities/user.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column({ type: 'int', nullable: true })
  committeeId: number | null;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'text', nullable: true })
  linkedinLink: string | null;

  @Column({ type: 'text', nullable: true })
  cvLink: string | null;

  @Column({ type: 'enum', enum: Role, default: Role.MEMBER })
  targetRole: Role;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
  })
  status: ApplicationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
