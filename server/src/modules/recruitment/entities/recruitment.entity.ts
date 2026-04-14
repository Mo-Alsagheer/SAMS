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

export enum RecruitmentStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity('recruitment_processes')
export class RecruitmentProcess {
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

  @Column({ type: 'enum', enum: Role, default: Role.MEMBER })
  role: Role;

  @Column({ type: 'int', default: 0 })
  targetMembers: number;

  @Column({
    type: 'enum',
    enum: RecruitmentStatus,
    default: RecruitmentStatus.OPEN,
  })
  status: RecruitmentStatus;

  @Column({ type: 'text' })
  createdBy: string;

  @Column({ type: 'timestamp', nullable: true })
  openedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
