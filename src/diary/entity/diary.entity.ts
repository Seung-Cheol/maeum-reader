import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BeforeInsert, BeforeUpdate } from "typeorm";

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

 @Column({ type: 'timestamp' })
 public writingDay : Date;

 @Column({ type: 'timestamp' })
 public createdAt : Date;

 @Column({ type: 'timestamp' })
 public updatedAt : Date

 @BeforeInsert()
 updateCreatedAt() { 
    this.createdAt = new Date();
    this.writingDay = new Date(this.writingDay);
  }

  @BeforeUpdate()
  updateUpdatedAt() {
    this.createdAt = new Date();
  }
}