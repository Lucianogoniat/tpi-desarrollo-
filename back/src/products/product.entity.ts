import { CategoryEntity } from 'src/categories/category.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class ProductEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ length: 256 })
	name!: string;

	@Column({
		type: 'numeric',
		precision: 14,
		scale: 4,
		transformer: {
			to: (value: number) => value,
			from: (value: string) => Number(value),
		},
	})
	price!: number;

	@Column({ default: 0 })
	stock!: number;

	@ManyToOne(() => CategoryEntity, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'categoryId' })
	category!: CategoryEntity | null;

	@Column({ nullable: true, type: 'integer' })
	categoryId!: number | null;
}
