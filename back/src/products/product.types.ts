import {
	IsInt,
	IsIn,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	Max,
	MaxLength,
	Min,
	MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { Category } from '../categories/category.types';

export type Product = {
	id: number;
	name: string;
	price: number;
	stock: number;
	categoryId: number | null;
	category?: Category | null;
};

export class CreateProductInput {
	@IsString()
	@MinLength(1)
	@MaxLength(256)
	name!: string;

	@IsNumber({ maxDecimalPlaces: 4 })
	@IsPositive()
	price!: number;

	@IsInt()
	@IsOptional()
	@Min(0)
	stock?: number;

	@IsInt()
	@Min(1)
	@IsOptional()
	categoryId?: number | null;
}

export class UpdateProductInput {
	@IsString()
	@MinLength(1)
	@MaxLength(256)
	@IsOptional()
	name?: string;

	@IsNumber({ maxDecimalPlaces: 4 })
	@IsPositive()
	@IsOptional()
	price?: number;

	@IsInt()
	@Min(0)
	@IsOptional()
	stock?: number;

	@IsInt()
	@Min(1)
	@IsOptional()
	categoryId?: number | null;
}

export class ListProductsQuery {
	@IsString()
	@IsOptional()
	name?: string;

	@IsIn(['id', 'name', 'price', 'stock'])
	@IsOptional()
	sortBy: 'id' | 'name' | 'price' | 'stock' = 'id';

	@IsIn(['ASC', 'DESC'])
	@IsOptional()
	order: 'ASC' | 'DESC' = 'ASC';

	@Type(() => Number)
	@IsInt()
	@Min(1)
	@IsOptional()
	page = 1;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	@IsOptional()
	limit = 10;
}
