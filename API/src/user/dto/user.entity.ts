import { JoinTable, Entity, ManyToMany, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, OneToOne} from 'typeorm';
import { Match } from './match.entity';
import { UserStats } from './stats.entity';

@Entity()
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({nullable: true, unique: true})
	username: string;
	
	@Column({unique: true})
	login: string;
	// @Column({ unique: true })
	// email: string;

	@Column({ unique: true })
	access_token: string;

	// @BeforeInsert()
	// emailToLowerCase() {
	// 	this.email = this.email.toLowerCase();
	// }

	@OneToOne(() => UserStats, {cascade: true})
    @JoinColumn()
	userstats: UserStats
	
	@ManyToMany(type => UserEntity, (user) => user.friends)
	@JoinTable({ joinColumn: {} })
	friends: UserEntity[];


	@ManyToMany(() => Match, {cascade: true})
    @JoinColumn()
	history: Match
	
	// @OneToMany(() => Match, {cascade: true})
    // @JoinColumn()
	// history: Match


}