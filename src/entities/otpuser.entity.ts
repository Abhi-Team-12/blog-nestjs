import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ForeignKey } from 'typeorm';

@Entity('otp_logs')
export class OTPUser {
  @PrimaryGeneratedColumn()
  otp_id: number;

  @Column()
  user_id: number;

  @Column()
  user_email: string;

  @Column()
  user_contact: string;

  @Column()
  otp: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

}
