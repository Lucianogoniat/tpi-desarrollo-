import { ProductsService } from '../services/products.service';
import { CreateProductInput, ListProductsQuery, Product, UpdateProductInput } from '../product.types';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: ListProductsQuery): Promise<{
        items: Product[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: number): Promise<Product>;
    create(body: CreateProductInput): Promise<Product>;
    updateStock(id: number, quantity: number): Promise<Product>;
    update(id: number, body: UpdateProductInput): Promise<Product>;
    remove(id: number): Promise<Product>;
}
