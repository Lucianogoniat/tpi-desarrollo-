import { CategoriesService } from "../services/categories.service";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "../category.types";
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(name: string): Promise<Category[]>;
    findOne(id: number): Promise<Category>;
    create(Body: CreateCategoryInput): Promise<Category>;
    update(id: number, body: UpdateCategoryInput): Promise<Category>;
    remove(id: number): Promise<Category>;
}
