import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('Emotion')
export class Emotion {
  
  @PrimaryGeneratedColumn()
  public id : number;

  @Column()
  public diaryId : number;

  @Column()
  public emotion : string;

}