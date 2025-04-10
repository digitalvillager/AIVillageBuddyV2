
import request from 'supertest';
import express from 'express';
import { setupAuth } from '../auth';

describe('Auth Endpoints', () => {
  const app = express();
  setupAuth(app);

  it('returns 401 when not authenticated', async () => {
    const response = await request(app).get('/api/user');
    expect(response.status).toBe(401);
  });

  it('validates required fields on registration', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({});
    expect(response.status).toBe(400);
  });
});
