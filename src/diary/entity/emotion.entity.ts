import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('Emotion')
export class Emotion {
  
  @PrimaryGeneratedColumn()
  public id : number;

  @Column()
  diaryId : number;

  @Column()
  emotion : string;

}