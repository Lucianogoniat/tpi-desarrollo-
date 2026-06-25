import { z } from 'zod';
import { api } from '../api-client';
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
        handler: async ({ id }) => api.get(`/categories/${id}`),
    },
    {
        name: 'create_category',
        description: 'Crea una categoría. Requiere rol admin',
        inputSchema: { name: categoryName },
        handler: async (body) => api.post('/categories', body),
    },
    {
        name: 'update_category',
        description: 'Actualiza una categoría. Requiere rol admin',
        inputSchema: { id: categoryId, name: categoryName },
        handler: async ({ id, name }) => api.put(`/categories/${id}`, { name }),
    },
    {
        name: 'delete_category',
        description: 'Elimina una categoría. Requiere rol admin',
        inputSchema: { id: categoryId },
        handler: async ({ id }) => api.del(`/categories/${id}`),
    },
];
