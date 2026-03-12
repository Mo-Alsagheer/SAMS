import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ulid } from 'ulid';
import { Role } from '../../../common/constants/role.enum';
import { Committee } from '../../committees/entities/committee.entity';

export enum UserStatus {
  ACTIVE = 'active',
  FIRED = 'fired',
  HOLD = 'hold',
}

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ulid();
    }
  }

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  password?: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ type: 'text', nullable: true })
  committeeId: string | null;

  @ManyToOne(() => Committee, { nullable: true })
  @JoinColumn({ name: 'committeeId' })
  committee?: Committee;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'text', nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  university: string | null;

  @Column({ type: 'text', nullable: true })
  faculty: string | null;

  @Column({ type: 'text', nullable: true })
  academicLevel: string | null;

  @Column({ type: 'text', nullable: true })
  seasonNumbers: string | null;

  @Column({ type: 'text', nullable: true })
  nationalID: string | null;

  @Column({ type: 'text', nullable: true })
  universityID: string | null;

  @Column({ type: 'text', nullable: true })
  image: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
