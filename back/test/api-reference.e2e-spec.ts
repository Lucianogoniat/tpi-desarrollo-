import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

jest.setTimeout(30_000);

describe('Referencia de la API - punto 4 (e2e)', () => {
  let app: INestApplication;
  let database: DataSource;

  beforeAll(async () => {
    process.env.BCRYPT_COST = '4';
    process.env.EMAIL_MODE = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    database = app.get(DataSource);
  });

  beforeEach(async () => {
    await database.query(
      'TRUNCATE TABLE "products", "categories", "users" RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  async function register(email: string, password = '12345678') {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);
  }

  async function adminSession() {
    const response = await register('admin@mail.com');
    return { token: response.body.access_token as string, user: response.body.user };
  }

  async function userSession() {
    await adminSession();
    const response = await register('user@mail.com');
    return { token: response.body.access_token as string, user: response.body.user };
  }

  it('prueba POST /auth/register, POST /auth/login y GET /auth/me', async () => {
    const registered = await register('user@mail.com');

    expect(registered.body.user).toMatchObject({
      email: 'user@mail.com',
      role: 'admin',
      isVerified: false,
    });
    expect(registered.body.user).toHaveProperty('id');
    expect(registered.body.user).toHaveProperty('createdAt');
    expect(registered.body).toHaveProperty('access_token');
    expect(registered.body).not.toHaveProperty('verificationToken');

    const loggedIn = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@mail.com', password: '12345678' })
      .expect(201);

    expect(loggedIn.body.user.email).toBe('user@mail.com');
    expect(loggedIn.body).toHaveProperty('access_token');

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loggedIn.body.access_token}`)
      .expect(200);

    expect(me.body).toMatchObject({ email: 'user@mail.com', isVerified: false });
    expect(me.body).not.toHaveProperty('passwordHash');
  });

  it('prueba validación 400 y autenticación 401 de auth', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'invalido', password: 'corta' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nadie@mail.com', password: '12345678' })
      .expect(401);

    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('prueba verificación de email y reenvío de token', async () => {
    const registered = await register('verify@mail.com');
    expect(registered.body).not.toHaveProperty('verificationToken');

    const firstRows = await database.query(
      'SELECT "verificationToken", "isVerified" FROM "users" WHERE "id" = $1',
      [registered.body.user.id],
    );
    const firstToken = firstRows[0].verificationToken;
    expect(firstToken).toBeTruthy();
    expect(firstRows[0].isVerified).toBe(false);

    await request(app.getHttpServer())
      .post('/auth/resend-verification')
      .set('Authorization', `Bearer ${registered.body.access_token}`)
      .expect(201)
      .expect({ message: 'Email de verificación reenviado' });

    const secondRows = await database.query(
      'SELECT "verificationToken", "isVerified" FROM "users" WHERE "id" = $1',
      [registered.body.user.id],
    );
    const secondToken = secondRows[0].verificationToken;
    expect(secondToken).toBeTruthy();
    expect(secondToken).not.toBe(firstToken);

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token: secondToken })
      .expect(201)
      .expect({ message: 'Email verificado' });

    const verifiedRows = await database.query(
      'SELECT "verificationToken", "isVerified" FROM "users" WHERE "id" = $1',
      [registered.body.user.id],
    );
    expect(verifiedRows[0].verificationToken).toBeNull();
    expect(verifiedRows[0].isVerified).toBe(true);

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token: secondToken })
      .expect(400)
      .expect(({ body }) => expect(body.message).toBe('Token inválido o expirado'));
  });

  it('prueba recuperación y cambio de contraseña por token', async () => {
    await register('reset@mail.com');

    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'nadie@mail.com' })
      .expect(201)
      .expect({ message: 'Si el email existe, recibirás un link' });

    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'reset@mail.com' })
      .expect(201)
      .expect({ message: 'Si el email existe, recibirás un link' });

    const resetRows = await database.query(
      'SELECT "resetPasswordToken", "resetPasswordExpires" FROM "users" WHERE "email" = $1',
      ['reset@mail.com'],
    );
    const resetToken = resetRows[0].resetPasswordToken;
    expect(resetToken).toBeTruthy();
    expect(new Date(resetRows[0].resetPasswordExpires).getTime()).toBeGreaterThan(
      Date.now(),
    );

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: resetToken, password: 'nuevaPass99' })
      .expect(201)
      .expect({ message: 'Contraseña actualizada' });

    const cleanedRows = await database.query(
      'SELECT "resetPasswordToken", "resetPasswordExpires" FROM "users" WHERE "email" = $1',
      ['reset@mail.com'],
    );
    expect(cleanedRows[0].resetPasswordToken).toBeNull();
    expect(cleanedRows[0].resetPasswordExpires).toBeNull();

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: resetToken, password: 'otraPass99' })
      .expect(400)
      .expect(({ body }) => expect(body.message).toBe('Token inválido o expirado'));

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'reset@mail.com', password: 'nuevaPass99' })
      .expect(201);
  });

  it('prueba el CRUD y la paginación de /products', async () => {
    const { token } = await adminSession();
    const category = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Electrónica' })
      .expect(201);

    const created = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Teclado Mecánico',
        price: 85.99,
        stock: 25,
        categoryId: category.body.id,
      })
      .expect(201);

    expect(created.body).toMatchObject({
      name: 'Teclado Mecánico',
      price: 85.99,
      stock: 25,
      categoryId: category.body.id,
      category: { id: category.body.id, name: 'Electrónica' },
    });

    const list = await request(app.getHttpServer())
      .get('/products?name=teclado&sortBy=price&order=DESC&page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body).toMatchObject({ total: 1, page: 1, limit: 10 });
    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0].category.name).toBe('Electrónica');

    await request(app.getHttpServer())
      .get(`/products/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => expect(body.category.name).toBe('Electrónica'));

    await request(app.getHttpServer())
      .put(`/products/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 79.99, stock: 30 })
      .expect(200)
      .expect(({ body }) => expect(body).toMatchObject({ price: 79.99, stock: 30 }));

    await request(app.getHttpServer())
      .delete(`/products/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => expect(body.id).toBe(created.body.id));

    await request(app.getHttpServer())
      .get(`/products/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('prueba 400, 401, 403 y 404 en /products', async () => {
    const { token: userToken } = await userSession();

    await request(app.getHttpServer()).get('/products').expect(401);

    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Producto', price: 10 })
      .expect(403);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@mail.com', password: '12345678' })
      .expect(201);
    const adminToken = login.body.access_token;

    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '', price: -1 })
      .expect(400);

    await request(app.getHttpServer())
      .put('/products/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: 1 })
      .expect(404);

    await request(app.getHttpServer())
      .delete('/products/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('prueba el CRUD, orden y conflictos de /categories', async () => {
    const { token } = await adminSession();
    const auth = { Authorization: `Bearer ${token}` };

    const ropa = await request(app.getHttpServer())
      .post('/categories')
      .set(auth)
      .send({ name: 'Ropa' })
      .expect(201);
    const hogar = await request(app.getHttpServer())
      .post('/categories')
      .set(auth)
      .send({ name: 'Hogar' })
      .expect(201);

    const list = await request(app.getHttpServer())
      .get('/categories')
      .set(auth)
      .expect(200);
    expect(list.body.map((category: { name: string }) => category.name)).toEqual([
      'Hogar',
      'Ropa',
    ]);

    await request(app.getHttpServer())
      .get(`/categories/${ropa.body.id}`)
      .set(auth)
      .expect(200)
      .expect(({ body }) => expect(body.name).toBe('Ropa'));

    await request(app.getHttpServer())
      .post('/categories')
      .set(auth)
      .send({ name: 'ropa' })
      .expect(409);

    await request(app.getHttpServer())
      .put(`/categories/${ropa.body.id}`)
      .set(auth)
      .send({ name: 'Indumentaria' })
      .expect(200)
      .expect(({ body }) => expect(body.name).toBe('Indumentaria'));

    await request(app.getHttpServer())
      .put(`/categories/${ropa.body.id}`)
      .set(auth)
      .send({ name: hogar.body.name })
      .expect(409);

    await request(app.getHttpServer())
      .delete(`/categories/${ropa.body.id}`)
      .set(auth)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/categories/${ropa.body.id}`)
      .set(auth)
      .expect(404);
    await request(app.getHttpServer())
      .delete('/categories/999999')
      .set(auth)
      .expect(404);
  });

  it('prueba 400, 401 y 403 en /categories', async () => {
    const { token: userToken } = await userSession();

    await request(app.getHttpServer()).get('/categories').expect(401);
    await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Deportes' })
      .expect(403);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@mail.com', password: '12345678' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${login.body.access_token}`)
      .send({ name: '' })
      .expect(400);
  });

  it('prueba GET /users y PATCH /users/:id/role', async () => {
    const { token: adminToken, user: admin } = await adminSession();
    const registeredUser = await register('user@mail.com');
    const userToken = registeredUser.body.access_token;

    const users = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(users.body).toHaveLength(2);
    expect(users.body.every((user: object) => !('passwordHash' in user))).toBe(true);
    expect(users.body.every((user: object) => !('isVerified' in user))).toBe(true);

    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/users/${registeredUser.body.user.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.role).toBe('admin');
        expect(body).not.toHaveProperty('isVerified');
        expect(body).not.toHaveProperty('passwordHash');
      });

    await request(app.getHttpServer())
      .patch(`/users/${admin.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'user' })
      .expect(403);
  });

  it('prueba PATCH /users/me/password y PATCH /users/me/email', async () => {
    const { token } = await adminSession();

    await request(app.getHttpServer())
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: '12345678', newPassword: 'nuevaPass99' })
      .expect(200)
      .expect({ message: 'Password updated' });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@mail.com', password: 'nuevaPass99' })
      .expect(201);

    await request(app.getHttpServer())
      .patch('/users/me/email')
      .set('Authorization', `Bearer ${login.body.access_token}`)
      .send({ newEmail: 'nuevo@mail.com', password: 'nuevaPass99' })
      .expect(200)
      .expect({ message: 'Email updated' });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.access_token}`)
      .expect(200)
      .expect(({ body }) => expect(body.email).toBe('nuevo@mail.com'));

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nuevo@mail.com', password: 'nuevaPass99' })
      .expect(201);
  });
});
