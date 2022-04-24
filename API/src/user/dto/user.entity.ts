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


	@Column(/*{ select: false }*/)
	friends: string[];
	
	@Column(/*{ select: false }*/)
	status: string;

	@OneToOne(() => UserStats)
	@JoinColumn()
	stats: UserStats


	@BeforeInsert()
	emailToLowerCase() {
		this.email = this.email.toLowerCase();
	}

}
