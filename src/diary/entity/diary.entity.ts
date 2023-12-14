import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('Diary')
export class Diary {
 @PrimaryGeneratedColumn()
 public id : number;

 @Column()
 public userId : number;

 @Column()
 public summary : string;

 @Column('longtext')
 public content : string;

 @CreateDateColumn({ type: 'timestamp' })
 public createdAt : Date;

 @CreateDateColumn({ type: 'timestamp' })
 public updatedAt : Date
}