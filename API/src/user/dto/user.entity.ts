import { Entity, ManyToMany, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, OneToOne} from 'typeorm';
import { Match } from './match.entity';
import { UserStats } from './stats.entity';

@Entity()
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;
	
	@Column()
	login: string;
	// @Column({ unique: true })
	// email: string;

	// @Column(/*{ select: false }*/)
	// password: string;

	// @BeforeInsert()
	// emailToLowerCase() {
	// 	this.email = this.email.toLowerCase();
	// }

	@OneToOne(() => UserStats, {cascade: true})
    @JoinColumn()
	userstats: UserStats
	
	@ManyToMany(() => UserEntity, {cascade: true})
    @JoinColumn()
	friends: UserEntity

	@ManyToMany(() => Match, {cascade: true})
    @JoinColumn()
	history: Match
	
	// @OneToMany(() => Match, {cascade: true})
    // @JoinColumn()
	// history: Match


}