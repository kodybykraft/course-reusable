// Middleware disabled for local dev — no auth required
import { NextResponse } from 'next/server';
export default function middleware() { return NextResponse.next(); }
export const config = { matcher: [] };
