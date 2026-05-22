import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column()
  method: string;

  @Column()
  path: string;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ nullable: true })
  userId: string | null;

  @Column({ nullable: true })
  userRole: string | null;

  @Column({ type: 'text', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'json', nullable: true })
  params: any;

  @Column({ type: 'json', nullable: true })
  query: any;

  @Column({ type: 'json', nullable: true })
  body: any;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
