import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import express from 'express';
import app from '../app';
import { closeDatabase, query } from '../config/database';
import { AuthRequest, authorize } from '../middleware/auth.middleware';
import { SafeUser } from '../models/User';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
let baseUrl = '';
let server: ReturnType<typeof app.listen> | undefined;
const testEmails: string[] = [];

const createTestAccount = async (body: Record<string, unknown>) => {
  const email = `auth-${randomUUID()}@example.test`;
  testEmails.push(email);
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'SafePassword123!', full_name: 'Test Learner', ...body }),
  });
  return { email, response };
};

const getCookie = (response: Response): string => {
  const header = response.headers.get('set-cookie') || '';
  const token = /(?:^|;\s*)token=([^;]+)/.exec(header);
  assert.ok(token, 'expected an authentication cookie');
  return `token=${token[1]}`;
};

describe('Authentication API integration', { skip: !testDatabaseUrl }, () => {
  before(async () => {
    if (!testDatabaseUrl) return;
    const probe = await query('SELECT 1');
    assert.equal(probe.rowCount, 1);
    server = app.listen(0);
    await new Promise<void>((resolve) => server?.once('listening', resolve));
    const address = server?.address();
    assert.ok(address && typeof address !== 'string');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    if (testEmails.length) {
      await query('DELETE FROM users WHERE email = ANY($1)', [testEmails]);
    }
    if (server) {
      await new Promise<void>((resolve, reject) =>
        server?.close((error) => error ? reject(error) : resolve())
      );
    }
    await closeDatabase();
  });

  it('registers a student, stores a bcrypt hash, and never returns a JWT', async () => {
    const { email, response } = await createTestAccount({ role: 'admin' });
    assert.equal(response.status, 201);
    const data = await response.json() as { user: SafeUser; token?: string };
    assert.equal(data.user.role, 'student');
    assert.equal('token' in data, false);
    assert.match(response.headers.get('set-cookie') || '', /HttpOnly/i);

    const result = await query(
      'SELECT password_hash, role FROM users WHERE email = $1',
      [email]
    );
    assert.equal(result.rows[0].role, 'student');
    assert.notEqual(result.rows[0].password_hash, 'SafePassword123!');
    assert.match(result.rows[0].password_hash, /^\$2[aby]\$10\$/);
  });

  it('rejects duplicate emails regardless of case', async () => {
    const { email, response } = await createTestAccount({});
    assert.equal(response.status, 201);
    const duplicate = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: email.toUpperCase(),
        password: 'SafePassword123!',
        full_name: 'Duplicate',
      }),
    });
    assert.equal(duplicate.status, 409);
  });

  it('rejects invalid registration inputs', async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'short', full_name: '' }),
    });
    assert.equal(response.status, 400);

    const shortPassword = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: `short-${randomUUID()}@example.test`,
        password: 'short',
        full_name: 'Test Learner',
      }),
    });
    assert.equal(shortPassword.status, 400);
  });

  it('logs in with valid credentials and rejects invalid credentials', async () => {
    const { email, response: registration } = await createTestAccount({});
    assert.equal(registration.status, 201);
    const invalid = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'WrongPassword123!' }),
    });
    assert.equal(invalid.status, 401);

    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'SafePassword123!' }),
    });
    assert.equal(login.status, 200);
    const body = await login.json() as { user: SafeUser; token?: string };
    assert.equal(body.user.email, email);
    assert.equal('token' in body, false);
    assert.match(login.headers.get('set-cookie') || '', /HttpOnly/i);
  });

  it('protects /me and permits authenticated logout', async () => {
    const { response: registration } = await createTestAccount({});
    assert.equal(registration.status, 201);
    const cookie = getCookie(registration);
    const unauthenticated = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(unauthenticated.status, 401);

    const authenticated = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { cookie },
    });
    assert.equal(authenticated.status, 200);

    const logout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { cookie },
    });
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get('set-cookie') || '', /Max-Age=0|Expires=Thu, 01 Jan 1970/i);
  });

  it('keeps the API health endpoint and reports the database connection', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    const data = await response.json() as { status: string; database: string };
    assert.equal(data.status, 'ok');
    assert.equal(data.database, 'connected');
  });

  it('requires authentication for tutor requests and does not return a fabricated answer', async () => {
    const body = JSON.stringify({
      lessonId: 'demo-video-workspace',
      currentTimestamp: 12.5,
      question: 'What is covered so far?',
    });
    const unauthenticated = await fetch(`${baseUrl}/api/ai/tutor`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    assert.equal(unauthenticated.status, 401);

    const { response: registration } = await createTestAccount({});
    assert.equal(registration.status, 201);
    const authenticated = await fetch(`${baseUrl}/api/ai/tutor`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: getCookie(registration),
      },
      body,
    });
    assert.equal(authenticated.status, 503);
    const data = await authenticated.json() as { error: string; answer?: string };
    assert.match(data.error, /not configured/i);
    assert.equal('answer' in data, false);
    const invalid = await fetch(`${baseUrl}/api/ai/tutor`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: getCookie(registration),
      },
      body: JSON.stringify({ lessonId: 'demo', currentTimestamp: -1, question: 'Question?' }),
    });
    assert.equal(invalid.status, 400);
  });
});

describe('Authorization middleware', () => {
  it('allows admins and denies students on admin-only routes', async () => {
    const testApp = express();
    testApp.get(
      '/admin',
      (req, _res, next) => {
        const role = req.header('x-test-role');
        (req as AuthRequest).user = {
          id: 1,
          email: 'test@example.test',
          role: role === 'admin' ? 'admin' : 'student',
        };
        next();
      },
      authorize(['admin']),
      (_req, res) => res.sendStatus(204)
    );
    const testServer = testApp.listen(0);
    try {
      await new Promise<void>((resolve) => testServer.once('listening', resolve));
      const address = testServer.address();
      assert.ok(address && typeof address !== 'string');
      const url = `http://127.0.0.1:${address.port}/admin`;
      const student = await fetch(url, { headers: { 'x-test-role': 'student' } });
      const admin = await fetch(url, { headers: { 'x-test-role': 'admin' } });
      assert.equal(student.status, 403);
      assert.equal(admin.status, 204);
    } finally {
      await new Promise<void>((resolve, reject) =>
        testServer.close((error) => error ? reject(error) : resolve())
      );
    }
  });
});
