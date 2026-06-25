import { z } from 'zod';
import { api } from '../api-client';
const userId = z.string().uuid();
export default [
    {
        name: 'list_users',
        description: 'Lista los usuarios registrados. Requiere rol admin',
        handler: async () => api.get('/users'),
    },
    {
        name: 'update_user_role',
        description: 'Cambia el rol de un usuario. Requiere rol admin',
        inputSchema: { id: userId, role: z.enum(['user', 'admin']) },
        handler: async ({ id, role }) => api.patch(`/users/${id}/role`, { role }),
    },
    {
        name: 'update_my_password',
        description: 'Cambia la contraseña del usuario autenticado',
        inputSchema: {
            currentPassword: z.string().min(1),
            newPassword: z.string().min(8),
        },
        handler: async (body) => api.patch('/users/me/password', body),
    },
    {
        name: 'update_my_email',
        description: 'Cambia el email del usuario autenticado',
        inputSchema: {
            newEmail: z.string().email(),
            password: z.string().min(1),
        },
        handler: async (body) => api.patch('/users/me/email', body),
    },
];
