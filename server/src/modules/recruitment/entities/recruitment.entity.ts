import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../../common/constants/role.enum';

export enum RecruitmentStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity('recruitment_processes')
export class RecruitmentProcess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  committeeId: number | null;

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

  @Column({ type: 'int' })
  createdBy: number;

  @Column({ type: 'timestamp', nullable: true })
  openedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
