'use server';

import { getCourse } from '../create-course.js';

export async function login(email: string, password: string) {
  const app = getCourse();
  if (!app.auth.login) {
    throw new Error('Built-in auth is not enabled. Configure a custom auth adapter with login support.');
  }
  return app.auth.login(email, password);
}

export async function register(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  const app = getCourse();
  if (!app.auth.register) {
    throw new Error('Built-in auth is not enabled. Configure a custom auth adapter with register support.');
  }
  return app.auth.register(input);
}

export async function logout(token: string) {
  const app = getCourse();
  if (!app.auth.logout) {
    throw new Error('Built-in auth is not enabled. Configure a custom auth adapter with logout support.');
  }
  return app.auth.logout(token);
}

export async function validateToken(token: string) {
  const app = getCourse();
  return app.auth.validateToken(token);
}
