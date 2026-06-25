import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
	Query,
	ParseIntPipe,
	UseGuards,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import {
	CreateProductInput,
	ListProductsQuery,
	Product,
	UpdateProductInput,
} from '../product.types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';

@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	findAll(@Query() query: ListProductsQuery): Promise<{
		items: Product[];
		total: number;
		page: number;
		limit: number;
	}> {
		return this.productsService.findAll(
			query.name,
			query.sortBy,
			query.order,
			query.page,
			query.limit,
		);
	}
  
	@Get(':id')
	@UseGuards(JwtAuthGuard)
	findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
		return this.productsService.findOne(id);
	}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	create(@Body() body: CreateProductInput): Promise<Product> {
		return this.productsService.create(body);
	}

	@Patch(':id/stock')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	updateStock(
		@Param('id', ParseIntPipe) id: number,
		@Body('quantity') quantity: number,
	): Promise<Product> {
		return this.productsService.updateStock(id, quantity);
	}

	@Put(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() body: UpdateProductInput,
	): Promise<Product> {
		return this.productsService.update(id, body);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	remove(@Param('id', ParseIntPipe) id: number): Promise<Product> {
		return this.productsService.remove(id);
	}
}
