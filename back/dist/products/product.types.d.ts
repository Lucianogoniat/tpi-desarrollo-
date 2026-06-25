import type { Category } from '../categories/category.types';
export type Product = {
    id: number;
    name: string;
    price: number;
    stock: number;
    categoryId: number | null;
    category?: Category | null;
};
export declare class CreateProductInput {
    name: string;
    price: number;
    stock?: number;
    categoryId?: number | null;
}
export declare class UpdateProductInput {
    name?: string;
    price?: number;
    stock?: number;
    categoryId?: number | null;
}
export declare class ListProductsQuery {
    name?: string;
    sortBy: 'id' | 'name' | 'price' | 'stock';
    order: 'ASC' | 'DESC';
    page: number;
    limit: number;
}
