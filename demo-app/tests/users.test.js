// tests/users.test.js — BEFORE state: only 1 test, 12% effective coverage
const request = require('supertest');
const { app, server } = require('../src/index');

// ⚠️ Only happy-path login tested — no edge cases
describe('User Login', () => {
  test('POST /api/users/login returns 200', async () => {
    // This test doesn't even assert meaningful data
    const res = await request(app).post('/api/users/login').send({});
    expect(res.status).toBeDefined();
  });
});

afterAll(() => {
  server.close();
});

// Missing tests:
// - SQL injection attempt → should be rejected
// - Register with no password
// - Duplicate username
// - Login with wrong password
// - Token expiry
// - Admin route without auth
// - Path traversal on /image
// - Negative order amount
// - IDOR on orders
