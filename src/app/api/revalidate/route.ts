import { timingSafeEqual } from 'crypto'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

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
    if (type === 'layout') {
      revalidatePath(path, 'layout')
    } else {
      revalidatePath(path)
    }
    return NextResponse.json({ revalidated: true, now: Date.now() })
  }

  return NextResponse.json({ revalidated: false, message: 'Missing path' })
}
