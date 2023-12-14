import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity('User')
export class User {

  @PrimaryGeneratedColumn()
  public id : number;

  @Column()
  public mediaType : string;

  @Column({
    unique:true
  })
  public mediaId : string;

  @Column()
  public nickname : string;


}