import {
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { CATEGORIES_REPOSITORY } from '../repositories/typeormCategoriesRepository';
import { CategoriesRepository } from '../repositories/categories.respository';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../category.types';

@Injectable()
export class CategoriesService {
	constructor(
		@Inject(CATEGORIES_REPOSITORY)
		private readonly categoriesRepository: CategoriesRepository,
	) {}

	async findAll(name?: string): Promise<Category[]> {
		const categories = await this.categoriesRepository.findAll();
		if (!name) return categories;
		return categories.filter(
			(category) => category.name.toUpperCase() === name.toUpperCase(),
		);
	}

	async findOne(id: number): Promise<Category> {
		const category = await this.categoriesRepository.findById(id);
		if (!category) throw new NotFoundException('Category not found');
		return category;
	}

	async create(input: CreateCategoryInput): Promise<Category> {
		await this.ensureUniqueName(input.name);
		return this.categoriesRepository.create(input);
	}

  async update(id: number, input: UpdateCategoryInput): Promise<Category> {
    if (input.name !== undefined) await this.ensureUniqueName(input.name, id)
    const category = await this.categoriesRepository.update(id, input)
    if (!category) throw new NotFoundException('Category not found')
    return category
  }

	async remove(id: number): Promise<Category> {
		const category = await this.categoriesRepository.remove(id);
		if (!category) throw new NotFoundException('Category not found');
		return category;
	}

	private async ensureUniqueName(name: string, currentId?: number): Promise<void> {
		const categories = await this.categoriesRepository.findAll();
		const exists = categories.some(
			(category) =>
				category.id !== currentId &&
				category.name.trim().toUpperCase() === name.trim().toUpperCase(),
		);
		if (exists) throw new ConflictException('Category name already exists');
	}
}
