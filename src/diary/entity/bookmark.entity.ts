import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Bookmark')
export class bookmark {
  @PrimaryGeneratedColumn()
  public id : number;

  @Column()
  public userId : number;

  @Column()
  public diaryId : number;
}