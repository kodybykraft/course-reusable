import { NextResponse } from 'next/server';
import { createCourseRouteHandler } from '@course/next';
import '../../../lib/course';
import { course } from '../../../lib/course';

export const dynamic = 'force-dynamic';

const handler = course ? createCourseRouteHandler() : null;

const noDB = () => NextResponse.json(
  { error: 'Database not configured. Set DATABASE_URL to enable API.' },
  { status: 503 },
);

export const GET = handler?.GET ?? noDB;
export const POST = handler?.POST ?? noDB;
export const PATCH = handler?.PATCH ?? noDB;
export const DELETE = handler?.DELETE ?? noDB;
