import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class TfaUser {
   @PrimaryGeneratedColumn("uuid")
   id: number;

   @Column({ unique: true })
   email: string;

   @Column()
   password: string

   @Column({ select: false, nullable: true })
   authConfirmToken: string


   @Column({ default: false, nullable: true })
   isVerified: Boolean;

}
