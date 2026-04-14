import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ulid } from 'ulid';
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

@Entity('applications')
export class Application {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ulid();
    }
  }

  @Column({ type: 'text', nullable: true })
  committeeId: string | null;

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
