import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const expectedToken = process.env.CACHE_REVALIDATION_TOKEN
  const providedToken =
    request.nextUrl.searchParams.get('token') || request.headers.get('x-revalidate-token')

  if (!expectedToken || providedToken !== expectedToken) {
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
