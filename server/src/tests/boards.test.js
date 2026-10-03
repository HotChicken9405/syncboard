import request from 'supertest';
import app from '../app.js';

const testUser = {
  name: 'Board User',
  email: 'boards@example.com',
  password: 'Test@1234',
};

async function registerAndLogin() {
  const res = await request(app).post('/api/auth/register').send(testUser);
  return res.body.data.token;
}

describe('Boards — CRUD', () => {
  it('creates a board with default columns', async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Board', color: '#d52b1e' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Board');
    expect(res.body.data.createdBy).toBeDefined();

    const cols = await request(app)
      .get(`/api/boards/${res.body.data._id}/columns`)
      .set('Authorization', `Bearer ${token}`);

    expect(cols.body.data.length).toBe(3);
    expect(cols.body.data[0].name).toBe('To Do');
  });

  it('lists boards for the current user', async () => {
    const token = await registerAndLogin();

    await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Board One', color: '#111' });

    await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Board Two', color: '#222' });

    const res = await request(app)
      .get('/api/boards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('deletes a board', async () => {
    const token = await registerAndLogin();

    const create = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'To Delete', color: '#111' });

    const boardId = create.body.data._id;

    const del = await request(app)
      .delete(`/api/boards/${boardId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(del.status).toBe(204);

    const list = await request(app)
      .get('/api/boards')
      .set('Authorization', `Bearer ${token}`);

    expect(list.body.data.length).toBe(0);
  });

  it('rejects board creation without auth', async () => {
    const res = await request(app)
      .post('/api/boards')
      .send({ name: 'No Auth Board', color: '#111' });

    expect(res.status).toBe(401);
  });

  it('does not return other users boards', async () => {
    const token = await registerAndLogin();

    await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Private Board', color: '#111' });

    const other = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other', email: 'other@example.com', password: 'Test@1234' });

    const otherToken = other.body.data.token;

    const res = await request(app)
      .get('/api/boards')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.body.data.length).toBe(0);
  });
});