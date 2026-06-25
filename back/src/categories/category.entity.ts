import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128, unique: true })
  name!: string;
}
