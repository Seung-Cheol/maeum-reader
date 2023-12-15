import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Bookmark')
export class Bookmark {
  @PrimaryGeneratedColumn()
  public id : number;

  @Column()
  public userId : number;

  @Column()
  public diaryId : number;
}