import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn} from 'typeorm';
import { UserEntity } from './user.entity'

@Entity()
export class Match {
	@PrimaryGeneratedColumn()
	id:number;

	@Column()
	winner: string;

	@Column()
	player1: string;
	
	@Column()
	player2: string;

	@Column()
	time: number;

	@Column()
	streak: number;


	// @OneToOne(() => UserEntity)
    // @JoinColumn()
	// userentity :UserEntity

}