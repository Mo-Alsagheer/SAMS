import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ulid } from 'ulid';
import { CommitteeType } from '../enums/committee-type.enum';

@Entity('committees')
export class Committee {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ulid();
    }
  }

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: CommitteeType })
  type: CommitteeType;

  @Column({ type: 'text', nullable: true })
  planID: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  directorIDs: string[];

  @Column({ type: 'int', default: 0 })
  membersCount: number;

  @Column({ type: 'text', nullable: true })
  whatsappGroupLink: string | null;

  @Column({ type: 'text' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
