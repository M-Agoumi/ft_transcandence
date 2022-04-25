import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, JoinColumn, OneToOne } from 'typeorm';
import { UserStats } from './stats.entity';

@Entity()
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column({ unique: true })
	email: string;

	@Column(/*{ select: false }*/)
	password: string;

	@BeforeInsert()
	emailToLowerCase() {
		this.email = this.email.toLowerCase();
	}

}