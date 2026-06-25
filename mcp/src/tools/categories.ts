import { z } from 'zod';
import { api } from '../api-client';
import type { ToolDef } from '../tool-factory';

const categoryId = z.number().int().positive();
const categoryName = z.string().min(1).max(128);

export default [
  {
    name: 'list_categories',
    description: 'Lista todas las categorías ordenadas por nombre',
    handler: async () => api.get('/categories'),
  },
  {
    name: 'get_category',
    description: 'Obtiene una categoría por ID',
    inputSchema: { id: categoryId },
    handler: async ({ id }: { id: number }) => api.get(`/categories/${id}`),
  },
  {
    name: 'create_category',
    description: 'Crea una categoría. Requiere rol admin',
    inputSchema: { name: categoryName },
    handler: async (body: { name: string }) => api.post('/categories', body),
  },
  {
    name: 'update_category',
    description: 'Actualiza una categoría. Requiere rol admin',
    inputSchema: { id: categoryId, name: categoryName },
    handler: async ({ id, name }: { id: number; name: string }) =>
      api.put(`/categories/${id}`, { name }),
  },
  {
    name: 'delete_category',
    description: 'Elimina una categoría. Requiere rol admin',
    inputSchema: { id: categoryId },
    handler: async ({ id }: { id: number }) => api.del(`/categories/${id}`),
  },
] as ToolDef[];
