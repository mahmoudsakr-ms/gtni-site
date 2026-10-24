import { timingSafeEqual } from 'crypto'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// E2E-5: allow-list check for `path` before it reaches `revalidatePath()`.
// Must stay permissive enough to accept every shape this codebase actually
// sends -- see src/utilities/revalidate.ts (`triggerRevalidate`/`toArabicPath`):
// '/', '/about-gtni', '/scholarships', '/ar', '/ar/about-gtni', etc. -- i.e.
// absolute site paths made of segments of letters/digits/hyphens/underscores,
// with no '..' traversal, query string, or protocol-relative ('//') tricks.
const MAX_PATH_LENGTH = 200
const VALID_PATH_PATTERN = /^\/[a-zA-Z0-9\-_/]*$/

function isValidRevalidatePath(path: string): boolean {
  if (path.length === 0 || path.length > MAX_PATH_LENGTH) return false
  if (!path.startsWith('/')) return false
  if (path.includes('..')) return false
  if (path.includes('//')) return false
  return VALID_PATH_PATTERN.test(path)
}

// SEC-L1: plain `!==` on secret tokens leaks timing information proportional to
// how many leading bytes match, which can help an attacker brute-force the
// token byte-by-byte. Compare in constant time instead -- lengths are checked
// (and compared with `!==`, which is safe since length is not secret) before
// calling timingSafeEqual, which throws if buffer lengths differ.
const isTokenValid = (provided: string | null, expected: string): boolean => {
  if (!provided) return false
  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)
  if (providedBuffer.length !== expectedBuffer.length) return false
  return timingSafeEqual(providedBuffer, expectedBuffer)
}

export async function GET(request: NextRequest) {
  const expectedToken = process.env.CACHE_REVALIDATION_TOKEN
  const providedToken =
    request.nextUrl.searchParams.get('token') || request.headers.get('x-revalidate-token')

  if (!expectedToken || !isTokenValid(providedToken, expectedToken)) {
    return NextResponse.json({ revalidated: false, message: 'Unauthorized' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path')
  const type = request.nextUrl.searchParams.get('type') as 'layout' | 'page' | undefined

  if (path) {
    if (!isValidRevalidatePath(path)) {
      return NextResponse.json({ revalidated: false, message: 'Invalid path' }, { status: 400 })
    }
    if (type === 'layout') {
      revalidatePath(path, 'layout')
    } else {
      revalidatePath(path)
    }
    return NextResponse.json({ revalidated: true, now: Date.now() })
  }

  // E2E-6: missing path is a client error, not a successful no-op -- match the
  // 401 pattern above by returning a non-200 status instead of {revalidated:false}/200.
  return NextResponse.json({ revalidated: false, message: 'Missing path' }, { status: 400 })
}
