# TPI Desarrollo

Aplicación full-stack Angular + NestJS, persistida en PostgreSQL, con verificación
de email, recuperación de contraseña y un servidor MCP que expone la API.

## Puesta en marcha

1. Levantar PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

2. Copiar `back/.env.example` a `back/.env`. El modo local simula los emails,
   por lo que no requiere una cuenta SMTP para probar la API manualmente.

3. Instalar dependencias e iniciar cada aplicación:

   ```bash
   cd back && npm install && npm run start:dev
   cd front && npm install && npm start
   cd mcp && npm install && npm start
   ```

## Tests e2e con PostgreSQL

La base de tests es efímera y está separada de la base de desarrollo:

```bash
docker compose --profile test up -d postgres-test
cd back
DATABASE_URL=postgresql://tp_test:tp_test_password@localhost:55432/tp_final_test \
DB_DROP_SCHEMA=true DB_SYNCHRONIZE=true EMAIL_MODE=test \
JWT_SECRET=test-secret npm run test:e2e -- --runInBand
```

Para probar nuevamente desde una base completamente vacía:

```bash
docker compose down -v
docker compose up -d postgres
```

En producción, eliminar `EMAIL_MODE=test` y configurar un SMTP real en
`back/.env`.
