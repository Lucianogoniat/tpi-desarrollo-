import { z } from "zod";
import { api } from "../api-client";
import type { ToolDef } from "../tool-factory";

const productId = z.number().int().positive();
const productName = z.string().min(1).max(256);
const price = z.number().positive().refine(
  (value) => Number.isInteger(value * 10000),
  "price must have at most 4 decimals",
);
const stock = z.number().int().min(0);
const categoryId = z.number().int().positive().nullable();

function params(args: Record<string, unknown>) {
  return {
    params: Object.fromEntries(
      Object.entries(args).filter(([, value]) => value !== undefined),
    ),
  };
}

export default [
  {
    name: "list_products",
    description: "Lista productos con filtros opcionales y paginacion",
    inputSchema: {
      name: z.string().optional(),
      sortBy: z.enum(["id", "name", "price", "stock"]).optional(),
      order: z.enum(["ASC", "DESC"]).optional(),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    handler: async (args: any) => api.get("/products", params(args)),
  },
  {
    name: "get_product",
    description: "Obtiene un producto por ID",
    inputSchema: { id: productId },
    handler: async ({ id }: any) => api.get(`/products/${id}`),
  },
  {
    name: "create_product",
    description: "Crea un producto nuevo. Requiere rol admin",
    inputSchema: {
      name: productName,
      price,
      stock: stock.optional(),
      categoryId: categoryId.optional(),
    },
    handler: async (body: any) => api.post("/products", body),
  },
  {
    name: "update_product",
    description: "Actualiza un producto existente. Requiere rol admin",
    inputSchema: {
      id: productId,
      name: productName.optional(),
      price: price.optional(),
      stock: stock.optional(),
      categoryId: categoryId.optional(),
    },
    handler: async ({ id, ...body }: any) => api.put(`/products/${id}`, body),
  },
  {
    name: "delete_product",
    description: "Elimina un producto existente. Requiere rol admin",
    inputSchema: { id: productId },
    handler: async ({ id }: any) => api.del(`/products/${id}`),
  },
] as ToolDef[];
