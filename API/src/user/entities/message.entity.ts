import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinTable, OneToMany, Column, OneToOne, JoinColumn } from 'typeorm';
import { Convo } from './conversation.entity';

@Entity()
export class Message {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Convo, (convo) => convo.messages)
	convo: Convo

}