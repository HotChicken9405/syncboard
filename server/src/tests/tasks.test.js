import request from 'supertest';
import app from '../app.js';

const testUser = {
  name: 'Task User',
  email: 'tasks@example.com',
  password: 'Test@1234',
};

async function setup() {
  const regRes = await request(app).post('/api/auth/register').send(testUser);
  const token  = regRes.body.data.token;

  const boardRes = await request(app)
    .post('/api/boards')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Task Board', color: '#111' });

  const boardId = boardRes.body.data._id;

  const colsRes = await request(app)
    .get(`/api/boards/${boardId}/columns`)
    .set('Authorization', `Bearer ${token}`);

  const columnId = colsRes.body.data[0]._id;

  return { token, boardId, columnId };
}

describe('Tasks — CRUD', () => {
  it('creates a task in a column', async () => {
    const { token, boardId, columnId } = await setup();

    const res = await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task', columnId, priority: 'normal' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test Task');
    expect(String(res.body.data.columnId)).toBe(String(columnId));
  });

  it('lists all tasks on a board', async () => {
    const { token, boardId, columnId } = await setup();

    await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task One', columnId, priority: 'low' });

    await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task Two', columnId, priority: 'high' });

    const res = await request(app)
      .get(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('updates a task', async () => {
    const { token, boardId, columnId } = await setup();

    const create = await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Original Title', columnId, priority: 'normal' });

    const taskId  = create.body.data._id;
    const version = create.body.data.version;

    const res = await request(app)
      .patch(`/api/boards/${boardId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title', version });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
  });

  it('detects version conflict on concurrent update', async () => {
    const { token, boardId, columnId } = await setup();

    const create = await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Conflict Task', columnId, priority: 'normal' });

    const taskId = create.body.data._id;

    await request(app)
      .patch(`/api/boards/${boardId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'First Update', version: 1 });

    const res = await request(app)
      .patch(`/api/boards/${boardId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Stale Update', version: 1 });

    expect(res.status).toBe(409);
  });

  it('deletes a task', async () => {
    const { token, boardId, columnId } = await setup();

    const create = await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To Delete', columnId, priority: 'normal' });

    const taskId = create.body.data._id;

    const del = await request(app)
      .delete(`/api/boards/${boardId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(del.status).toBe(204);

    const list = await request(app)
      .get(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${token}`);

    expect(list.body.data.length).toBe(0);
  });

  it('rejects task creation without auth', async () => {
    const { boardId, columnId } = await setup();

    const res = await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .send({ title: 'No Auth Task', columnId, priority: 'normal' });

    expect(res.status).toBe(401);
  });
});