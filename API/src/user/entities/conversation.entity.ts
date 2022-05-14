import { JoinTable, Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, Column, OneToOne, JoinColumn } from 'typeorm';
import { Message } from './message.entity';
import { UserEntity } from './user.entity'

@Entity()
export class Convo {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => UserEntity)
    @JoinColumn()
    owner: UserEntity

	@OneToMany(type => UserEntity, (administrators) => administrators.convo)
	administrators: UserEntity[];

	@OneToMany(type => Message, (messages) => messages.convo)
	messages: Message[];

	@ManyToMany(() => UserEntity) 
	@JoinTable()
	users: UserEntity[]

}
